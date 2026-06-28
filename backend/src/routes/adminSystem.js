import { Router } from 'express';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { superAdminMiddleware } from '../middleware/superAdmin.js';

const router = Router();

router.use(authMiddleware, superAdminMiddleware);

const DATA_TABLES = ['order_combos', 'order_items', 'orders', 'combo_products', 'combos', 'products', 'categories', 'reviews', 'discount_codes', 'customers'];

async function getSettings() {
  const [rows] = await pool.query('SELECT `key`, `value` FROM store_settings');
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  return settings;
}

async function backupData() {
  const data = {};
  for (const table of DATA_TABLES) {
    const [rows] = await pool.query(`SELECT * FROM ${table}`);
    data[table] = rows;
  }
  data.settings = await getSettings();
  return data;
}

async function restoreData(data) {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const table of DATA_TABLES) {
      await pool.query(`DELETE FROM ${table}`);
      if (data[table]?.length > 0) {
        const cols = Object.keys(data[table][0]).join('`, `');
        const placeholders = data[table][0].map(() => '?').join(', ');
        for (const row of data[table]) {
          await pool.query(`INSERT INTO \`${table}\` (\`${cols}\`) VALUES (${placeholders})`, Object.values(row));
        }
      }
    }
    if (data.settings) {
      for (const [key, value] of Object.entries(data.settings)) {
        await pool.query(
          'INSERT INTO store_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
          [key, String(value), String(value)]
        );
      }
    }
  } finally {
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  }
}

import { rubroSettings, seeds } from '../seedData.js';

function productImageUrl(name) {
  return `https://picsum.photos/seed/${encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase())}/400/400`;
}

router.post('/reset', async (req, res) => {
  try {
    const { rubro } = req.body;
    if (!rubro) return res.status(400).json({ error: 'Rubro requerido' });

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      for (const table of DATA_TABLES) {
        await pool.query(`DELETE FROM ${table}`);
      }

      const settings = rubroSettings[rubro] || rubroSettings.ferreteria;
      for (const [key, value] of Object.entries(settings)) {
        await pool.query(
          'INSERT INTO store_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
          [key, String(value), String(value)]
        );
      }

      const data = seeds[rubro] || seeds.ferreteria;
      for (const cat of data.categories) {
        await pool.query(
          'INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
          [cat.name, cat.slug, cat.icon, cat.sort_order]
        );
      }
      const [cats] = await pool.query('SELECT id, slug FROM categories');
      const catMap = {};
      cats.forEach(r => { catMap[r.slug] = r.id; });

      for (const p of data.products) {
        const catId = catMap[p.cat];
        if (!catId) continue;
        await pool.query(
          'INSERT INTO products (category_id, name, description, price, unit, emoji, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [catId, p.name, p.desc || null, p.price, p.unit, p.emoji, productImageUrl(p.name)]
        );
      }

      for (const c of data.combos) {
        const [result] = await pool.query(
          'INSERT INTO combos (name, description, emoji, price) VALUES (?, ?, ?, ?)',
          [c.name, c.desc, c.emoji, c.price]
        );
        if (c.products?.length > 0) {
          const [prods] = await pool.query('SELECT id, name FROM products WHERE name IN (?)', [c.products]);
          const values = prods.map(p => [result.insertId, p.id]);
          if (values.length > 0) {
            await pool.query('INSERT INTO combo_products (combo_id, product_id) VALUES ?', [values]);
          }
        }
      }

      const reviews = [
        { name: 'María López', rating: 5, text: 'Excelente atención y productos de primera calidad.' },
        { name: 'Carlos Méndez', rating: 5, text: 'Muy buena variedad y precios competitivos.' },
        { name: 'Ana Gómez', rating: 4, text: 'Buena calidad, encontré todo lo que necesitaba.' },
        { name: 'Pedro Martínez', rating: 4, text: 'Buena atención y asesoramiento.' },
        { name: 'Sofía Ramírez', rating: 5, text: 'Productos de calidad y precio justo.' },
      ];
      for (const r of reviews) {
        await pool.query(
          'INSERT INTO reviews (customer_name, rating, text, is_approved) VALUES (?, ?, ?, TRUE)',
          [r.name, r.rating, r.text]
        );
      }
    } finally {
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    }

    res.json({ message: `Sistema reseteado para rubro: ${rubro}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clean', async (req, res) => {
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of DATA_TABLES) {
      await pool.query(`DELETE FROM ${table}`);
    }
    await pool.query('DELETE FROM store_settings');
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    res.json({ message: 'Todos los datos eliminados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const { rubro } = req.body;
    if (!rubro) return res.status(400).json({ error: 'Rubro requerido' });

    const settings = rubroSettings[rubro] || rubroSettings.ferreteria;
    const data = seeds[rubro] || seeds.ferreteria;

    for (const [key, value] of Object.entries(settings)) {
      await pool.query(
        'INSERT INTO store_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
        [key, String(value), String(value)]
      );
    }

    for (const cat of data.categories) {
      await pool.query(
        'INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
        [cat.name, cat.slug, cat.icon, cat.sort_order]
      );
    }
    const [cats] = await pool.query('SELECT id, slug FROM categories');
    const catMap = {};
    cats.forEach(r => { catMap[r.slug] = r.id; });

    for (const p of data.products) {
      const catId = catMap[p.cat];
      if (!catId) continue;
      await pool.query(
        'INSERT INTO products (category_id, name, description, price, unit, emoji, image) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [catId, p.name, p.desc || null, p.price, p.unit, p.emoji, productImageUrl(p.name)]
      );
    }

    for (const c of data.combos) {
      const [result] = await pool.query(
        'INSERT INTO combos (name, description, emoji, price) VALUES (?, ?, ?, ?)',
        [c.name, c.desc, c.emoji, c.price]
      );
      if (c.products?.length > 0) {
        const [prods] = await pool.query('SELECT id, name FROM products WHERE name IN (?)', [c.products]);
        const values = prods.map(p => [result.insertId, p.id]);
        if (values.length > 0) {
          await pool.query('INSERT INTO combo_products (combo_id, product_id) VALUES ?', [values]);
        }
      }
    }

    const reviews = [
      { name: 'María López', rating: 5, text: 'Excelente atención y productos de primera calidad.' },
      { name: 'Carlos Méndez', rating: 5, text: 'Muy buena variedad y precios competitivos.' },
      { name: 'Ana Gómez', rating: 4, text: 'Buena calidad, encontré todo lo que necesitaba.' },
      { name: 'Pedro Martínez', rating: 4, text: 'Buena atención y asesoramiento.' },
      { name: 'Sofía Ramírez', rating: 5, text: 'Productos de calidad y precio justo.' },
    ];
    for (const r of reviews) {
      await pool.query(
        'INSERT INTO reviews (customer_name, rating, text, is_approved) VALUES (?, ?, ?, TRUE)',
        [r.name, r.rating, r.text]
      );
    }

    res.json({ message: `Datos de ejemplo cargados para rubro: ${rubro}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/backup', async (req, res) => {
  try {
    const data = await backupData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/restore', async (req, res) => {
  try {
    await restoreData(req.body);
    res.json({ message: 'Restauración completada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
