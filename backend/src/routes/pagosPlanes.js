import { Router } from 'express';
import pool from '../config/db.js';
import config from '../config/env.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.get('/mi-plan', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT t.plan_id, t.fecha_vencimiento, p.nombre as plan_nombre, p.precio, p.limite_productos FROM tenants t LEFT JOIN planes p ON p.id = t.plan_id WHERE t.id = ?',
      [req.user.tenantId]
    );
    if (!rows[0]) return res.json({ plan: null });
    const t = rows[0];
    res.json({
      plan_id: t.plan_id,
      plan_nombre: t.plan_nombre,
      precio: t.precio,
      limite_productos: t.limite_productos,
      fecha_vencimiento: t.fecha_vencimiento,
      vencida: t.fecha_vencimiento ? new Date(t.fecha_vencimiento) < new Date() : false,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/create-preference', authMiddleware, async (req, res) => {
  try {
    const { plan_id } = req.body;
    if (!plan_id) return res.status(400).json({ error: 'plan_id requerido' });

    const [planRows] = await pool.query('SELECT * FROM planes WHERE id = ? AND activo = TRUE', [plan_id]);
    if (!planRows[0]) return res.status(404).json({ error: 'Plan no encontrado' });

    const plan = planRows[0];
    const monto = Number(plan.precio);
    if (monto <= 0) return res.status(400).json({ error: 'El plan es gratuito' });

    const { MercadoPagoConfig, Preference } = await import('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: config.mercadopagoToken, options: { timeout: 5000 } });

    const host = req.get('x-forwarded-host') || req.get('host') || 'accomputacion.com.ar';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const [pagoResult] = await pool.query(
      'INSERT INTO pagos_planes (tenant_id, plan_id, monto) VALUES (?, ?, ?)',
      [req.user.tenantId, plan_id, monto]
    );
    const pagoId = pagoResult.insertId;

    const body = {
      items: [{ id: `plan-${plan.id}`, title: `Plan ${plan.nombre} - ${plan.limite_productos === 9999 ? 'Ilimitado' : plan.limite_productos + ' productos'}`, quantity: 1, unit_price: monto, currency_id: 'ARS' }],
      back_urls: { success: `${baseUrl}/${req.user.tenantId ? `multitienda/${req.params.tenant || ''}/admin` : 'multitienda/admin'}/settings`, failure: `${baseUrl}/multitienda/`, pending: `${baseUrl}/multitienda/` },
      auto_return: 'approved',
      external_reference: JSON.stringify({ pago_id: pagoId, tenant_id: req.user.tenantId, plan_id }),
      notification_url: `${baseUrl}/multitienda/api/mercadopago/webhook`,
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    await pool.query('UPDATE pagos_planes SET mp_preference_id = ? WHERE id = ?', [result.id, pagoId]);

    res.json({ preference_id: result.id, init_point: result.init_point, pago_id: pagoId });
  } catch (err) {
    console.error('MP plan preference error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/pagos', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.tenantId || req.query.tenant_id;
    const [rows] = await pool.query(
      'SELECT pp.*, p.nombre as plan_nombre FROM pagos_planes pp JOIN planes p ON p.id = pp.plan_id WHERE pp.tenant_id = ? ORDER BY pp.created_at DESC',
      [tenantId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/registrar-pago-manual', authMiddleware, async (req, res) => {
  try {
    const { tenant_id, plan_id, monto } = req.body;
    if (!tenant_id || !plan_id) return res.status(400).json({ error: 'tenant_id y plan_id requeridos' });

    const [result] = await pool.query(
      'INSERT INTO pagos_planes (tenant_id, plan_id, monto, metodo_pago, estado, registrado_por) VALUES (?, ?, ?, ?, ?, ?)',
      [tenant_id, plan_id, monto || 0, 'manual', 'aprobado', req.user.id]
    );

    const [tenant] = await pool.query('SELECT fecha_vencimiento FROM tenants WHERE id = ?', [tenant_id]);
    const ahora = new Date();
    const actual = tenant[0]?.fecha_vencimiento ? new Date(tenant[0].fecha_vencimiento) : null;
    const desde = actual && actual > ahora ? actual : ahora;
    const nuevoVen = new Date(desde);
    nuevoVen.setDate(nuevoVen.getDate() + 30);
    await pool.query('UPDATE tenants SET plan_id = ?, fecha_vencimiento = ? WHERE id = ?', [plan_id, nuevoVen.toISOString().slice(0, 10), tenant_id]);

    res.json({ message: 'Pago registrado', vence: nuevoVen.toISOString().slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webhook-pago-plan', async (req, res) => {
  res.sendStatus(200);
  try {
    const externalRef = req.body?.external_reference || (typeof req.body?.resource === 'string' ? req.body.resource : null);
    if (!externalRef) return;

    let ref;
    try { ref = JSON.parse(externalRef); } catch { return; }

    const { pago_id, tenant_id, plan_id } = ref;
    if (!pago_id) return;

    await pool.query('UPDATE pagos_planes SET mp_payment_id = ?, mp_status = ?, estado = ? WHERE id = ?',
      [req.body?.data?.id || req.body?.id, 'approved', 'aprobado', pago_id]);

    const [tenant] = await pool.query('SELECT fecha_vencimiento FROM tenants WHERE id = ?', [tenant_id]);
    const ahora = new Date();
    const actual = tenant[0]?.fecha_vencimiento ? new Date(tenant[0].fecha_vencimiento) : null;
    const desde = actual && actual > ahora ? actual : ahora;
    const nuevoVen = new Date(desde);
    nuevoVen.setDate(nuevoVen.getDate() + 30);
    await pool.query('UPDATE tenants SET plan_id = ?, fecha_vencimiento = ? WHERE id = ?', [plan_id, nuevoVen.toISOString().slice(0, 10), tenant_id]);
  } catch {}
});

export default router;
