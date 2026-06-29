import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { superAdminMiddleware } from '../middleware/superAdmin.js';

const router = Router();
router.use(authMiddleware, superAdminMiddleware);

router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM planes ORDER BY precio');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { slug, nombre, precio, limite_productos } = req.body;
    if (!slug || !nombre) return res.status(400).json({ error: 'slug y nombre requeridos' });
    const [result] = await pool.query(
      'INSERT INTO planes (slug, nombre, precio, limite_productos) VALUES (?, ?, ?, ?)',
      [slug, nombre, precio || 0, limite_productos || 10]
    );
    const [rows] = await pool.query('SELECT * FROM planes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El slug ya existe' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { slug, nombre, precio, limite_productos, activo } = req.body;
    await pool.query(
      'UPDATE planes SET slug=?, nombre=?, precio=?, limite_productos=?, activo=? WHERE id=?',
      [slug, nombre, precio, limite_productos, activo ?? true, req.params.id]
    );
    const [rows] = await pool.query('SELECT * FROM planes WHERE id = ?', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: 'Plan no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM planes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Plan eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
