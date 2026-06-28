import { Router } from 'express';
import pool from '../config/db.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, phone } = req.body;
    const [existing] = await pool.query('SELECT * FROM customers WHERE phone = ?', [phone]);
    if (existing[0]) return res.json(existing[0]);
    const [result] = await pool.query(
      'INSERT INTO customers (name, phone, points) VALUES (?, ?, 0)',
      [name || null, phone]
    );
    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:phone', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customers WHERE phone = ?', [req.params.phone]);
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/points', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, points FROM customers WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/points/redeem', async (req, res) => {
  try {
    const { points } = req.body;
    const [customer] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    if (!customer[0]) return res.status(404).json({ error: 'Cliente no encontrado' });
    if (customer[0].points < points) return res.status(400).json({ error: 'Puntos insuficientes' });

    await pool.query('UPDATE customers SET points = points - ? WHERE id = ?', [points, req.params.id]);
    const discountAmount = Math.floor(points / 1000) * 10000;
    const codigo = `CANJE-${req.params.id}-${Date.now()}`.toUpperCase();

    await pool.query(
      'INSERT INTO discount_codes (code, discount_amount, customer_id) VALUES (?, ?, ?)',
      [codigo, discountAmount, req.params.id]
    );

    const [rows] = await pool.query('SELECT * FROM customers WHERE id = ?', [req.params.id]);
    res.json({ customer: rows[0], code: codigo, discount: discountAmount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
