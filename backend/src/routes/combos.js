import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM combos WHERE is_active = TRUE ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, emoji, price } = req.body;
    const [result] = await pool.query(
      'INSERT INTO combos (name, description, emoji, price) VALUES (?, ?, ?, ?)',
      [name, description || null, emoji || '✨', price]
    );
    const [rows] = await pool.query('SELECT * FROM combos WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, emoji, price, is_active } = req.body;
    await pool.query(
      'UPDATE combos SET name=?, description=?, emoji=?, price=?, is_active=? WHERE id=?',
      [name, description, emoji, price, is_active ?? true, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM combos WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM combos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Combo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
