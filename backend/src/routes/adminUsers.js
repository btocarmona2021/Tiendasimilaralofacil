import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { superAdminMiddleware } from '../middleware/superAdmin.js';

const router = Router();

router.use(authMiddleware, superAdminMiddleware);

router.get('/', async (req, res) => {
  const [rows] = await pool.query('SELECT id, username, role, created_at FROM users WHERE tenant_id IS NULL ORDER BY created_at');
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const [result] = await pool.query(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, hash, role || 'admin']
    );
    res.status(201).json({ id: result.insertId, username, role: role || 'admin' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'El usuario ya existe' });
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  const [users] = await pool.query('SELECT username, role FROM users WHERE id = ?', [req.params.id]);
  if (!users[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (users[0].role === 'super_admin') return res.status(403).json({ error: 'No se puede eliminar el super admin' });
  await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  res.json({ message: 'Usuario eliminado' });
});

router.put('/:id', async (req, res) => {
  const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!users[0]) return res.status(404).json({ error: 'Usuario no encontrado' });
  if (users[0].role === 'super_admin' && req.user.id !== Number(req.params.id)) {
    return res.status(403).json({ error: 'No se puede modificar el super admin' });
  }
  const { username, password, role } = req.body;
  if (username) await pool.query('UPDATE users SET username = ? WHERE id = ?', [username, req.params.id]);
  if (password) {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [hash, req.params.id]);
  }
  if (role && req.user.id !== Number(req.params.id)) {
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
  }
  res.json({ message: 'Usuario actualizado' });
});

export default router;
