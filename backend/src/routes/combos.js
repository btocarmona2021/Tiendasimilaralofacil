import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const [combos] = await pool.query(
      'SELECT * FROM combos WHERE is_active = TRUE ORDER BY id'
    );
    const results = [];
    for (const c of combos) {
      const [products] = await pool.query(
        'SELECT p.id, p.name, p.description, p.price, p.unit, p.emoji, p.image FROM combo_products cp JOIN products p ON p.id = cp.product_id WHERE cp.combo_id = ?',
        [c.id]
      );
      results.push({ ...c, products });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const [combos] = await pool.query('SELECT * FROM combos ORDER BY id');
    const results = [];
    for (const c of combos) {
      const [products] = await pool.query(
        'SELECT p.id, p.name, p.description, p.price, p.unit, p.emoji, p.image FROM combo_products cp JOIN products p ON p.id = cp.product_id WHERE cp.combo_id = ?',
        [c.id]
      );
      results.push({ ...c, products });
    }
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name, description, emoji, price, product_ids } = req.body;
    const [result] = await conn.query(
      'INSERT INTO combos (name, description, emoji, price) VALUES (?, ?, ?, ?)',
      [name, description || null, emoji || '✨', price]
    );
    const comboId = result.insertId;

    if (product_ids && product_ids.length > 0) {
      const values = product_ids.map(pid => [comboId, pid]);
      await conn.query('INSERT INTO combo_products (combo_id, product_id) VALUES ?', [values]);
    }

    await conn.commit();

    const [rows] = await pool.query('SELECT * FROM combos WHERE id = ?', [comboId]);
    const [products] = await pool.query(
      'SELECT p.id, p.name, p.description, p.price, p.unit, p.emoji, p.image FROM combo_products cp JOIN products p ON p.id = cp.product_id WHERE cp.combo_id = ?',
      [comboId]
    );
    res.status(201).json({ ...rows[0], products });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { name, description, emoji, price, is_active, product_ids } = req.body;
    await conn.query(
      'UPDATE combos SET name=?, description=?, emoji=?, price=?, is_active=? WHERE id=?',
      [name, description, emoji, price, is_active ?? true, req.params.id]
    );

    if (product_ids) {
      await conn.query('DELETE FROM combo_products WHERE combo_id = ?', [req.params.id]);
      const values = product_ids.map(pid => [req.params.id, pid]);
      if (values.length > 0) {
        await conn.query('INSERT INTO combo_products (combo_id, product_id) VALUES ?', [values]);
      }
    }

    await conn.commit();

    const [rows] = await pool.query('SELECT * FROM combos WHERE id = ?', [req.params.id]);
    const [products] = await pool.query(
      'SELECT p.id, p.name, p.description, p.price, p.unit, p.emoji, p.image FROM combo_products cp JOIN products p ON p.id = cp.product_id WHERE cp.combo_id = ?',
      [req.params.id]
    );
    res.json({ ...rows[0], products });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM combo_products WHERE combo_id = ?', [req.params.id]);
    await pool.query('DELETE FROM combos WHERE id = ?', [req.params.id]);
    res.json({ message: 'Combo eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
