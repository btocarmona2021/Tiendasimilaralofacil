import pool from '../config/db.js';

export async function suscripcionMiddleware(req, res, next) {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return next();

    const [rows] = await pool.query(
      'SELECT t.plan_id, t.fecha_vencimiento, p.nombre as plan_nombre, p.limite_productos FROM tenants t LEFT JOIN planes p ON p.id = t.plan_id WHERE t.id = ?',
      [tenantId]
    );
    if (!rows[0]) return next();

    const t = rows[0];
    req.plan = {
      id: t.plan_id,
      nombre: t.plan_nombre,
      limite_productos: t.limite_productos || 9999,
      vencida: t.fecha_vencimiento ? new Date(t.fecha_vencimiento) < new Date() : false,
      fecha_vencimiento: t.fecha_vencimiento,
    };
    next();
  } catch (err) {
    next();
  }
}
