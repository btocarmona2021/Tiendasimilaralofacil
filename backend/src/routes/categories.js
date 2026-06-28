import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE is_active = TRUE ORDER BY sort_order'
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
      'INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?)',
      [name, slug, icon || '📦', sort_order || 0]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, slug, icon, sort_order, is_active } = req.body;
    await pool.query(
      'UPDATE categories SET name=?, slug=?, icon=?, sort_order=?, is_active=? WHERE id=?',
      [name, slug, icon, sort_order, is_active ?? true, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    res.json({ message: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
