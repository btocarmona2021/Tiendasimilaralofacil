import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import config from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password, tenant } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!users[0]) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const user = users[0];
    const payload = { id: user.id, username: user.username, role: user.role, tenantId: user.tenant_id };

    if (user.role === 'super_admin' && tenant) {
      const [t] = await pool.query('SELECT id, slug FROM tenants WHERE slug = ?', [tenant]);
      if (t[0]) payload.tenantId = t[0].id;
    }

    if (user.role !== 'super_admin' && tenant) {
      const [t] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [tenant]);
      if (t[0] && user.tenant_id !== t[0].id) return res.status(401).json({ error: 'No tienes acceso a esta tienda' });
    }

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, username: user.username, role: user.role, tenantId: payload.tenantId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;
