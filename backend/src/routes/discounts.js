import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;
    const [rows] = await pool.query(
      'SELECT * FROM discount_codes WHERE code = ? AND usado = FALSE',
      [code.toUpperCase()]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Código inválido o ya usado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/mark-used', async (req, res) => {
  try {
    const { id } = req.body;
    await pool.query('UPDATE discount_codes SET usado = TRUE WHERE id = ?', [id]);
    res.json({ message: 'Código marcado como usado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { code, discount_amount } = req.body;
    const [result] = await pool.query(
      'INSERT INTO discount_codes (code, discount_amount) VALUES (?, ?)',
      [code.toUpperCase(), discount_amount]
    );
    const [rows] = await pool.query('SELECT * FROM discount_codes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM discount_codes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
