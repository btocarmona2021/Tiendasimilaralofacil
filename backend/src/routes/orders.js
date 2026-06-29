import { Router } from 'express';
import { randomUUID } from 'crypto';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { customer_name, customer_phone, delivery_type, address, pickup_date, pickup_time, items, combos, subtotal, shipping, discount, total } = req.body;

    const [orderResult] = await conn.query(
      `INSERT INTO orders (tenant_id, customer_name, customer_phone, delivery_type, address, pickup_date, pickup_time, subtotal, shipping, discount, total)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.tenantId, customer_name, customer_phone, delivery_type || 'retiro', address || null, pickup_date || null, pickup_time || null, subtotal, shipping || 0, discount || 0, total]
    );

    const orderId = orderResult.insertId;

    if (items && items.length > 0) {
      const values = items.map(i => [orderId, i.product_id, i.product_name, i.quantity, i.unit_price, req.tenantId]);
      await conn.query(
        'INSERT INTO order_items (order_id, product_id, product_name, quantity, unit_price, tenant_id) VALUES ?',
        [values]
      );
      for (const item of items) {
        await conn.query(
          'UPDATE products SET stock = GREATEST(-1, stock - ?) WHERE id = ? AND tenant_id = ? AND stock >= 0',
          [item.quantity, item.product_id, req.tenantId]
        );
      }
    }

    if (combos && combos.length > 0) {
      const values = combos.map(c => [orderId, c.combo_id, c.combo_name, c.price, req.tenantId]);
      await conn.query(
        'INSERT INTO order_combos (order_id, combo_id, combo_name, price, tenant_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.status(201).json({ order_id: orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM orders WHERE tenant_id = ? ORDER BY created_at DESC', [req.tenantId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [order] = await pool.query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    if (!order[0]) return res.status(404).json({ error: 'Pedido no encontrado' });
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    const [combos] = await pool.query('SELECT * FROM order_combos WHERE order_id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ ...order[0], items, combos });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    let reviewToken = null;
    if (status === 'entregado') {
      const [existing] = await pool.query('SELECT review_token FROM orders WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
      if (!existing[0]?.review_token) {
        reviewToken = randomUUID();
      }
    }
    await pool.query(
      'UPDATE orders SET status = ?, review_token = COALESCE(?, review_token) WHERE id = ? AND tenant_id = ?',
      [status, reviewToken, req.params.id, req.tenantId]
    );
    const [rows] = await pool.query('SELECT * FROM orders WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM order_items WHERE order_id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    await pool.query('DELETE FROM order_combos WHERE order_id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    await pool.query('DELETE FROM orders WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ message: 'Pedido eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
