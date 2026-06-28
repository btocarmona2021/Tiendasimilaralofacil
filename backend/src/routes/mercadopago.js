import { Router } from 'express';
import config from '../config/env.js';
import pool from '../config/db.js';

const router = Router();

router.post('/create-preference', async (req, res) => {
  try {
    const { items, combos, subtotal, shipping, discount, total, customer_name, customer_phone, delivery_type, address, pickup_date, pickup_time } = req.body;

    const { MercadoPagoConfig, Preference } = await import('mercadopago');

    const client = new MercadoPagoConfig({
      accessToken: config.mercadopagoToken,
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
        `INSERT INTO orders (customer_name, customer_phone, delivery_type, address, pickup_date, pickup_time, subtotal, shipping, discount, total, payment_method)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [customer_name, customer_phone, delivery_type || 'retiro', address || null, pickup_date || null, pickup_time || null, subtotal, shipping || 0, discount || 0, total, 'mercadopago']
      );
      orderId = orderResult.insertId;

      if (items && items.length > 0) {
        const values = items.map(i => [orderId, i.product_id, i.product_name, i.quantity, i.unit_price]);
        await conn.query('INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price) VALUES ?', [values]);
      }
      if (combos && combos.length > 0) {
        const values = combos.map(c => [orderId, c.combo_id, c.combo_name, c.price]);
        await conn.query('INSERT INTO order_combos (order_id, combo_id, combo_name, price) VALUES ?', [values]);
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
        success: `${baseUrl}/shop/`,
        failure: `${baseUrl}/shop/`,
        pending: `${baseUrl}/shop/`,
      },
      auto_return: 'approved',
      external_reference: JSON.stringify({ order_id: orderId }),
      notification_url: `${baseUrl}/shop/api/mercadopago/webhook`,
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

router.post('/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const type = req.body?.type || req.query?.topic || req.query?.type;
    const data = req.body?.data || {};
    let paymentId = data?.id || req.body?.id || req.query?.id || req.body?.resource?.id;

    console.log('MP webhook received:', JSON.stringify({ type, paymentId, topic: req.query?.topic, bodyKeys: Object.keys(req.body || {}) }).slice(0, 300));

    if (type === 'payment' || type === 'merchant_order' || req.query?.topic === 'payment') {
      const { MercadoPagoConfig, Payment } = await import('mercadopago');

      const client = new MercadoPagoConfig({
        accessToken: config.mercadopagoToken,
        options: { timeout: 5000 }
      });

      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });

      const status = paymentData.status;
      const externalRef = paymentData.external_reference;

      let orderId = null;
      if (externalRef) {
        try {
          const ref = JSON.parse(externalRef);
          orderId = ref.order_id;
        } catch {}
      }

      if (orderId) {
        await pool.query(
          `UPDATE orders SET mp_payment_id = ?, mp_status = ?, status = ? WHERE id = ?`,
          [String(paymentId), status, status === 'approved' ? 'confirmado' : 'pendiente', orderId]
        );
        console.log('MP webhook: order updated', { orderId, status, paymentId });
      }
    }
  } catch (err) {
  }
});

router.get('/webhook', (req, res) => res.sendStatus(200));

router.post('/check-status', async (req, res) => {
  try {
    const { preference_id, payment_id } = req.body;
    let sql, param;
    if (payment_id) { sql = 'SELECT mp_status, mp_payment_id, status FROM orders WHERE mp_payment_id = ?'; param = payment_id; }
    else { sql = 'SELECT mp_status, mp_payment_id, status FROM orders WHERE mp_preference_id = ?'; param = preference_id; }
    const [rows] = await pool.query(sql, [param]);
    res.json(rows[0] || { mp_status: null, status: 'pendiente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;