import { Router } from 'express';
import config from '../config/env.js';
import pool from '../config/db.js';

const router = Router();

router.post('/create-preference', async (req, res) => {
  try {
    const { items, combos, subtotal, shipping, discount, total, customer_name, customer_phone, delivery_type, address, pickup_date, pickup_time } = req.body;

    const { MercadoPagoConfig, Preference } = await import('mercadopago');

    const accessToken = req.tenant?.mp_access_token || config.mercadopagoToken;
    if (!accessToken) return res.status(400).json({ error: 'MercadoPago no configurado. Configurá tu token en Ajustes > Mercado Pago.' });

    const client = new MercadoPagoConfig({
      accessToken,
      options: { timeout: 5000 }
    });

    const preferenceItems = [];

    if (items && items.length > 0) {
      for (const item of items) {
        preferenceItems.push({
          id: String(item.product_id),
          title: item.product_name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          currency_id: 'ARS',
        });
      }
    }

    if (combos && combos.length > 0) {
      for (const combo of combos) {
        preferenceItems.push({
          id: `combo-${combo.combo_id}`,
          title: `Combo: ${combo.combo_name}`,
          quantity: 1,
          unit_price: Number(combo.price),
          currency_id: 'ARS',
        });
      }
    }

    const host = req.get('x-forwarded-host') || req.get('host') || 'accomputacion.com.ar';
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const baseUrl = `${protocol}://${host}`;

    const conn = await pool.getConnection();
    let orderId;
    try {
      await conn.beginTransaction();
      const [orderResult] = await conn.query(
        `INSERT INTO orders (tenant_id, customer_name, customer_phone, delivery_type, address, pickup_date, pickup_time, subtotal, shipping, discount, total, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [req.tenantId, customer_name, customer_phone, delivery_type || 'retiro', address || null, pickup_date || null, pickup_time || null, subtotal, shipping || 0, discount || 0, total, 'mercadopago']
      );
      orderId = orderResult.insertId;

      if (items && items.length > 0) {
        const values = items.map(i => [orderId, i.product_id, i.product_name, i.quantity, i.unit_price, req.tenantId]);
        await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, tenant_id) VALUES ?', [values]);
      }
      if (combos && combos.length > 0) {
        const values = combos.map(c => [orderId, c.combo_id, c.combo_name, c.price, req.tenantId]);
        await conn.query('INSERT INTO order_combos (order_id, combo_id, combo_name, price, tenant_id) VALUES ?', [values]);
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      conn.release();
      console.error('MP create-preference db error:', err.message);
      return res.status(500).json({ error: err.message });
    }
    conn.release();

    const body = {
      items: preferenceItems,
      back_urls: {
        success: `${baseUrl}/multitienda/${req.params.tenant}/`,
        failure: `${baseUrl}/multitienda/${req.params.tenant}/`,
        pending: `${baseUrl}/multitienda/${req.params.tenant}/`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({ order_id: orderId }),
      notification_url: `${baseUrl}/multitienda/${req.params.tenant}/api/mercadopago/webhook`,
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });

    await pool.query('UPDATE orders SET mp_preference_id = ? WHERE id = ?', [result.id, orderId]);

    res.json({ preference_id: result.id, init_point: result.init_point, order_id: orderId });
  } catch (err) {
    console.error('MP create-preference error:', err.message, err.stack?.slice(0, 500));
    res.status(500).json({ error: err.message });
  }
});

router.post('/check-status', async (req, res) => {
  try {
    const { preference_id, payment_id } = req.body;
    let sql, param;
    if (payment_id) { sql = 'SELECT mp_status, mp_payment_id, status FROM orders WHERE tenant_id = ? AND mp_payment_id = ?'; param = payment_id; }
    else { sql = 'SELECT mp_status, mp_payment_id, status FROM orders WHERE tenant_id = ? AND mp_preference_id = ?'; param = preference_id; }
    const [rows] = await pool.query(sql, [req.tenantId, param]);
    res.json(rows[0] || { mp_status: null, status: 'pendiente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
