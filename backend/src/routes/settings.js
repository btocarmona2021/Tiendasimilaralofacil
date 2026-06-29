import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const SETTING_COLUMNS = ['rubro', 'store_name', 'logo', 'subtitle', 'promo', 'whatsapp', 'currency', 'shipping_free', 'shipping_cost', 'info_hours', 'info_phone', 'info_delivery', 'info_payment', 'mp_alias', 'mp_cvu', 'mp_holder', 'mp_access_token', 'bank_entity', 'bank_cbu', 'bank_alias', 'bank_holder'];

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tenants WHERE id = ?', [req.tenantId]);
    if (!rows[0]) return res.status(404).json({ error: 'Tenant no encontrado' });
    const t = rows[0];
    const settings = {};
    SETTING_COLUMNS.forEach(col => { settings[col] = t[col]; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', authMiddleware, async (req, res) => {
  try {
    const entries = req.body;
    const allowed = Object.keys(entries).filter(k => SETTING_COLUMNS.includes(k));
    if (allowed.length === 0) return res.status(400).json({ error: 'No hay campos válidos' });

    const sets = allowed.map(k => `\`${k}\` = ?`).join(', ');
    const values = allowed.map(k => String(entries[k]));
    values.push(req.tenantId);

    await pool.query(`UPDATE tenants SET ${sets} WHERE id = ?`, values);

    const [rows] = await pool.query('SELECT * FROM tenants WHERE id = ?', [req.tenantId]);
    const t = rows[0];
    const settings = {};
    SETTING_COLUMNS.forEach(col => { settings[col] = t[col]; });
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
