import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { suscripcionMiddleware } from '../middleware/suscripcion.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.tenant_id = ? AND p.is_active = TRUE
    `;
    const params = [req.tenantId];
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    query += ' ORDER BY c.sort_order, p.name';
    const [rows] = await pool.query(query, params);

    for (const row of rows) {
      const [imgs] = await pool.query('SELECT url FROM product_images WHERE product_id = ? AND tenant_id = ? ORDER BY sort_order', [row.id, req.tenantId]);
      row.images = imgs.map(i => i.url);
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ? AND p.tenant_id = ?`,
      [req.params.id, req.tenantId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Producto no encontrado' });
    const [imgs] = await pool.query('SELECT url FROM product_images WHERE product_id = ? AND tenant_id = ? ORDER BY sort_order', [req.params.id, req.tenantId]);
    rows[0].images = imgs.map(i => i.url);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authMiddleware, suscripcionMiddleware, async (req, res) => {
  try {
    if (req.plan) {
      if (req.plan.vencida) {
        return res.status(403).json({ error: 'Suscripción vencida. Renové tu plan para seguir agregando productos.' });
      }
      const [cnt] = await pool.query('SELECT COUNT(*) as c FROM products WHERE tenant_id = ? AND is_active = TRUE', [req.tenantId]);
      if (cnt[0].c >= req.plan.limite_productos) {
        return res.status(403).json({ error: 'Límite de productos alcanzado. Actualizá tu plan para agregar más.' });
      }
    }
    const { category_id, name, description, price, stock, variantes, unit, emoji, image } = req.body;
    const [result] = await pool.query(
      'INSERT INTO products (tenant_id, category_id, name, description, price, stock, variantes, unit, emoji, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.tenantId, category_id, name, description || null, price, stock ?? -1, variantes || null, unit || 'unidad', emoji || '📦', image || null]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [result.insertId, req.tenantId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { category_id, name, description, price, stock, variantes, unit, emoji, image, is_active } = req.body;
    await pool.query(
      'UPDATE products SET category_id=?, name=?, description=?, price=?, stock=?, variantes=?, unit=?, emoji=?, image=?, is_active=? WHERE id=? AND tenant_id=?',
      [category_id, name, description, price, stock ?? -1, variantes || null, unit, emoji, image || null, is_active ?? true, req.params.id, req.tenantId]
    );
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM product_images WHERE product_id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    await pool.query('DELETE FROM products WHERE id = ? AND tenant_id = ?', [req.params.id, req.tenantId]);
    res.json({ message: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { stock } = req.body;
    await pool.query('UPDATE products SET stock = ? WHERE id = ? AND tenant_id = ?', [stock ?? -1, req.params.id, req.tenantId]);
    const [rows] = await pool.query('SELECT id, name, stock FROM products WHERE id = ?', [req.params.id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stock-bajo', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, stock, image FROM products WHERE tenant_id = ? AND stock >= 0 AND stock <= 5 ORDER BY stock',
      [req.tenantId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/images', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM product_images WHERE product_id = ? AND tenant_id = ? ORDER BY sort_order', [req.params.id, req.tenantId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/images', authMiddleware, async (req, res) => {
  try {
    const { url } = req.body;
    const [max] = await pool.query('SELECT MAX(sort_order) as m FROM product_images WHERE product_id = ?', [req.params.id]);
    const sortOrder = (max[0]?.m ?? -1) + 1;
    const [result] = await pool.query(
      'INSERT INTO product_images (product_id, tenant_id, url, sort_order) VALUES (?, ?, ?, ?)',
      [req.params.id, req.tenantId, url, sortOrder]
    );
    const [rows] = await pool.query('SELECT * FROM product_images WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:productId/images/:imageId', authMiddleware, async (req, res) => {
  try {
    await pool.query('DELETE FROM product_images WHERE id = ? AND product_id = ? AND tenant_id = ?',
      [req.params.imageId, req.params.productId, req.tenantId]);
    res.json({ message: 'Imagen eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
