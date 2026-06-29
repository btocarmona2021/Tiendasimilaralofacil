import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM reviews WHERE tenant_id = ? AND is_approved = TRUE ORDER BY created_at DESC',
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reviews WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { customer_name, rating, text } = req.body;
    const [result] = await pool.query(
      'INSERT INTO reviews (tenant_id, customer_name, rating, text) VALUES (?, ?, ?, ?)',
      [req.tenantId, customer_name, rating || 5, text]
    );
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? AND tenant_id = ?', [result.insertId, req.tenantId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/token/:token', async (req, res) => {
  try {
    const [order] = await pool.query(
      'SELECT id, customer_name, customer_phone, reviewed FROM orders WHERE review_token = ? AND tenant_id = ?',
      [req.params.token, req.tenantId]
    );
    if (!order[0]) return res.status(404).json({ error: 'Link inválido o expirado' });
    if (order[0].reviewed) return res.status(400).json({ error: 'Ya dejaste una reseña para esta compra' });

    const [items] = await pool.query('SELECT product_name FROM order_items WHERE order_id = ? AND tenant_id = ?', [order[0].id, req.tenantId]);
    const [combos] = await pool.query('SELECT combo_name FROM order_combos WHERE order_id = ? AND tenant_id = ?', [order[0].id, req.tenantId]);
    const purchased = [
      ...items.map(i => i.product_name),
      ...combos.map(c => c.combo_name),
    ];

    res.json({ customer_name: order[0].customer_name, items: purchased });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/submit', async (req, res) => {
  try {
    const { token, rating, text } = req.body;
    const [order] = await pool.query(
      'SELECT id, customer_name, customer_phone, reviewed, tenant_id FROM orders WHERE review_token = ?',
      [token]
    );
    if (!order[0]) return res.status(404).json({ error: 'Link inválido o expirado' });
    if (order[0].reviewed) return res.status(400).json({ error: 'Ya dejaste una reseña para esta compra' });

    const [result] = await pool.query(
      'INSERT INTO reviews (tenant_id, order_id, customer_name, customer_phone, rating, text) VALUES (?, ?, ?, ?, ?, ?)',
      [order[0].tenant_id, order[0].id, order[0].customer_name, order[0].customer_phone, rating || 5, text]
    );
    await pool.query('UPDATE orders SET reviewed = TRUE WHERE id = ?', [order[0].id]);

    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/approve', authMiddleware, async (req, res) => {
  try {
    await pool.query('UPDATE reviews SET is_approved = TRUE WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    const [rows] = await pool.query('SELECT * FROM reviews WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
