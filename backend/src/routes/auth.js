import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import config from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (!users[0]) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const valid = await bcrypt.compare(password, users[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });

    const token = jwt.sign({ id: users[0].id, username: users[0].username }, config.jwtSecret, { expiresIn: '7d' });
    res.json({ token, username: users[0].username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

export default router;
