import pool from '../config/db.js';

export async function tenantMiddleware(req, res, next) {
  try {
    const slug = req.params.tenant;
    if (!slug) return res.status(400).json({ error: 'Tenant slug requerido' });

    const [rows] = await pool.query('SELECT * FROM tenants WHERE slug = ? AND is_active = TRUE', [slug]);
    if (!rows[0]) return res.status(404).json({ error: 'Tienda no encontrada' });

    req.tenantId = rows[0].id;
    req.tenant = rows[0];
    next();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
