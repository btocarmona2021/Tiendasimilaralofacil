import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE tenant_id = ? AND is_active = TRUE ORDER BY sort_order',
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, slug, icon, sort_order } = req.body;
    const [result] = await pool.query(
      'INSERT INTO categories (tenant_id, name, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?)',
      [req.tenantId, name, slug, icon || '📦', sort_order || 0]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? AND tenant_id = ?', [result.insertId, req.tenantId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, slug, icon, sort_order, is_active } = req.body;
    await pool.query(
      'UPDATE categories SET name=?, slug=?, icon=?, sort_order=?, is_active=? WHERE id=? AND tenant_id=?',
      [name, slug, icon, sort_order, is_active ?? true, req.params.id, req.tenantId]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
