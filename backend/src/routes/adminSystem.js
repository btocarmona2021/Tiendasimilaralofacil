import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { extname } from 'path';
import pool from '../config/db.js';
import { authMiddleware } from '../middleware/auth.js';
import { superAdminMiddleware } from '../middleware/superAdmin.js';
import { rubroSettings, seeds } from '../seedData.js';
import { productImages } from '../productImages.js';
import { existsSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
const __imgDirname = dirname(fileURLToPath(import.meta.url));
const uploadBase = resolve(__imgDirname, '../../uploads');
const publicDir = resolve(__imgDirname, '../../public');

const router = Router();
router.use(authMiddleware, superAdminMiddleware);

const DATA_TABLES = ['order_combos', 'order_items', 'orders', 'combo_products', 'combos', 'products', 'categories', 'reviews', 'discount_codes', 'customers'];

function productImageUrl(name) {
  if (productImages[name]) return productImages[name];
  const s = name.replace(/\s+/g, '-').toLowerCase();
  return `/multitienda/seed-images/${s}.jpg`;
}

router.post('/reset', async (req, res) => {
  try {
    const { rubro, slug: bodySlug } = req.body;
    const slug = bodySlug || req.params.tenant;
    if (!rubro || !slug) return res.status(400).json({ error: 'Rubro y slug requeridos' });

    const settings = rubroSettings[rubro] || rubroSettings.ferreteria;
    const data = seeds[rubro] || seeds.ferreteria;

    const [existing] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
    let tenantId;
    if (existing[0]) {
      tenantId = existing[0].id;
      await pool.query('UPDATE tenants SET ? WHERE id = ?', [settings, tenantId]);
    } else {
      const [r] = await pool.query('INSERT INTO tenants SET ?', [{ slug, ...settings }]);
      tenantId = r.insertId;
    }

    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of DATA_TABLES) {
      await pool.query(`DELETE FROM ${table} WHERE tenant_id = ?`, [tenantId]);
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');

    for (const cat of data.categories) {
      await pool.query(
        'INSERT INTO categories (tenant_id, name, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
        [tenantId, cat.name, cat.slug, cat.icon, cat.sort_order]
      );
    }
    const [cats] = await pool.query('SELECT id, slug FROM categories WHERE tenant_id = ?', [tenantId]);
    const catMap = {};
    cats.forEach(r => { catMap[r.slug] = r.id; });

    for (const p of data.products) {
      const catId = catMap[p.cat];
      if (!catId) continue;
      await pool.query(
        'INSERT INTO products (tenant_id, category_id, name, description, price, unit, emoji, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [tenantId, catId, p.name, p.desc || null, p.price, p.unit, p.emoji, productImageUrl(p.name)]
      );
    }

    for (const c of data.combos) {
      const [result] = await pool.query(
        'INSERT INTO combos (tenant_id, name, description, emoji, price) VALUES (?, ?, ?, ?, ?)',
        [tenantId, c.name, c.desc, c.emoji, c.price]
      );
      if (c.products?.length > 0) {
        const [prods] = await pool.query('SELECT id, name FROM products WHERE tenant_id = ? AND name IN (?)', [tenantId, c.products]);
        const values = prods.map(p => [result.insertId, p.id, tenantId]);
        if (values.length > 0) {
          await pool.query('INSERT INTO combo_products (combo_id, product_id, tenant_id) VALUES ?', [values]);
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
        'INSERT INTO reviews (tenant_id, customer_name, rating, text, is_approved) VALUES (?, ?, ?, ?, TRUE)',
        [tenantId, r.name, r.rating, r.text]
      );
    }

    res.json({ message: `Tenant "${slug}" reseteado con rubro: ${rubro}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/clean', async (req, res) => {
  try {
    const { slug } = req.body;
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    if (slug) {
      const [t] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
      if (!t[0]) return res.status(404).json({ error: 'Tenant no encontrado' });
      for (const table of DATA_TABLES) {
        await pool.query(`DELETE FROM ${table} WHERE tenant_id = ?`, [t[0].id]);
      }
    } else {
      for (const table of DATA_TABLES) {
        await pool.query(`DELETE FROM ${table}`);
      }
    }
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    res.json({ message: slug ? `Datos de "${slug}" eliminados` : 'Todos los datos eliminados' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/seed', async (req, res) => {
  try {
    const { rubro, slug: bodySlug } = req.body;
    const slug = bodySlug || req.params.tenant;
    if (!rubro || !slug) return res.status(400).json({ error: 'Rubro y slug requeridos' });

    const settings = rubroSettings[rubro] || rubroSettings.ferreteria;
    const data = seeds[rubro] || seeds.ferreteria;

    const [existing] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
    const tenantId = existing[0]?.id;
    if (!tenantId) return res.status(404).json({ error: 'Tenant no encontrado. Creálo primero.' });

    for (const cat of data.categories) {
      await pool.query(
        'INSERT INTO categories (tenant_id, name, slug, icon, sort_order) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
        [tenantId, cat.name, cat.slug, cat.icon, cat.sort_order]
      );
    }
    const [cats] = await pool.query('SELECT id, slug FROM categories WHERE tenant_id = ?', [tenantId]);
    const catMap = {};
    cats.forEach(r => { catMap[r.slug] = r.id; });

    for (const p of data.products) {
      const catId = catMap[p.cat];
      if (!catId) continue;
      await pool.query(
        'INSERT INTO products (tenant_id, category_id, name, description, price, unit, emoji, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [tenantId, catId, p.name, p.desc || null, p.price, p.unit, p.emoji, productImageUrl(p.name)]
      );
    }

    for (const c of data.combos) {
      const [result] = await pool.query(
        'INSERT INTO combos (tenant_id, name, description, emoji, price) VALUES (?, ?, ?, ?, ?)',
        [tenantId, c.name, c.desc, c.emoji, c.price]
      );
      if (c.products?.length > 0) {
        const [prods] = await pool.query('SELECT id, name FROM products WHERE tenant_id = ? AND name IN (?)', [tenantId, c.products]);
        const values = prods.map(p => [result.insertId, p.id, tenantId]);
        if (values.length > 0) {
          await pool.query('INSERT INTO combo_products (combo_id, product_id, tenant_id) VALUES ?', [values]);
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
        'INSERT INTO reviews (tenant_id, customer_name, rating, text, is_approved) VALUES (?, ?, ?, ?, TRUE)',
        [tenantId, r.name, r.rating, r.text]
      );
    }

    res.json({ message: `Datos sembrados para tenant: ${slug} (${rubro})` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/backup', async (req, res) => {
  try {
    const { slug } = req.query;
    const data = {};
    if (slug) {
      const [t] = await pool.query('SELECT * FROM tenants WHERE slug = ?', [slug]);
      if (!t[0]) return res.status(404).json({ error: 'Tenant no encontrado' });
      data.tenant = t[0];
      for (const table of DATA_TABLES) {
        const [rows] = await pool.query(`SELECT * FROM ${table} WHERE tenant_id = ?`, [t[0].id]);
        data[table] = rows;
      }
    } else {
      const [tenants] = await pool.query('SELECT * FROM tenants');
      data.tenants = tenants;
      for (const table of DATA_TABLES) {
        const [rows] = await pool.query(`SELECT * FROM ${table}`);
        data[table] = rows;
      }
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=backup-${new Date().toISOString().slice(0, 10)}.json`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/restore', async (req, res) => {
  try {
    const data = req.body;
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    try {
      if (data.tenant) {
        const [existing] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [data.tenant.slug]);
        let tenantId;
        if (existing[0]) {
          tenantId = existing[0].id;
          await pool.query('UPDATE tenants SET ? WHERE id = ?', [data.tenant, tenantId]);
        } else {
          const [r] = await pool.query('INSERT INTO tenants SET ?', [data.tenant]);
          tenantId = r.insertId;
        }
        for (const table of DATA_TABLES) {
          await pool.query(`DELETE FROM ${table} WHERE tenant_id = ?`, [tenantId]);
          if (data[table]?.length > 0) {
            const cols = Object.keys(data[table][0]).join('`, `');
            const placeholders = data[table][0].map(() => '?').join(', ');
            for (const row of data[table]) {
              await pool.query(`INSERT INTO \`${table}\` (\`${cols}\`) VALUES (${placeholders})`, Object.values(row));
            }
          }
        }
      } else if (data.tenants) {
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
      }
    } finally {
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    res.json({ message: 'Restauración completada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/tenants', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT t.id, t.slug, t.rubro, t.store_name, t.is_active, t.created_at, t.plan_id, t.fecha_vencimiento, p.nombre as plan_nombre FROM tenants t LEFT JOIN planes p ON p.id = t.plan_id ORDER BY t.slug'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/tenants', async (req, res) => {
  try {
    const { slug, rubro, plan_id, admin_user, admin_pass } = req.body;
    if (!slug || !rubro) return res.status(400).json({ error: 'slug y rubro requeridos' });

    const [existing] = await pool.query('SELECT id FROM tenants WHERE slug = ?', [slug]);
    if (existing[0]) return res.status(400).json({ error: 'El slug ya existe' });

    let fechaVen = null;
    if (plan_id) {
      const [planRows] = await pool.query('SELECT precio FROM planes WHERE id = ?', [plan_id]);
      if (planRows[0] && Number(planRows[0].precio) > 0) {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        fechaVen = d.toISOString().slice(0, 10);
      }
    }

    const settings = rubroSettings[rubro] || rubroSettings.ferreteria;

    const [r] = await pool.query('INSERT INTO tenants SET ?', [{ slug, plan_id: plan_id || null, fecha_vencimiento: fechaVen, ...settings }]);
    const tenantId = r.insertId;

    const hash = await bcrypt.hash(admin_pass || 'admin123', 10);
    await pool.query(
      'INSERT INTO users (tenant_id, username, password_hash, role) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE password_hash=?, role=?, tenant_id=?',
      [tenantId, admin_user || 'admin', hash, 'admin', hash, 'admin', tenantId]
    );

    const [created] = await pool.query(
      'SELECT t.id, t.slug, t.rubro, t.store_name, t.is_active, t.created_at, t.plan_id, t.fecha_vencimiento, p.nombre as plan_nombre FROM tenants t LEFT JOIN planes p ON p.id = t.plan_id WHERE t.id = ?',
      [tenantId]
    );
    res.status(201).json({ ...created[0], admin_user: admin_user || 'admin', admin_pass: admin_pass || 'admin123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/tenants/:id', async (req, res) => {
  try {
    const { plan_id, fecha_vencimiento, is_active } = req.body;
    if (plan_id !== undefined) {
      await pool.query('UPDATE tenants SET plan_id = ? WHERE id = ?', [plan_id || null, req.params.id]);
    }
    if (fecha_vencimiento !== undefined) {
      await pool.query('UPDATE tenants SET fecha_vencimiento = ? WHERE id = ?', [fecha_vencimiento || null, req.params.id]);
    }
    if (is_active !== undefined) {
      await pool.query('UPDATE tenants SET is_active = ? WHERE id = ?', [is_active, req.params.id]);
    }
    const [rows] = await pool.query(
      'SELECT t.id, t.slug, t.rubro, t.store_name, t.is_active, t.created_at, t.plan_id, t.fecha_vencimiento, p.nombre as plan_nombre FROM tenants t LEFT JOIN planes p ON p.id = t.plan_id WHERE t.id = ?',
      [req.params.id]
    );
    res.json(rows[0] || { message: 'Actualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/tenants/:id', async (req, res) => {
  try {
    await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    for (const table of DATA_TABLES) {
      await pool.query(`DELETE FROM ${table} WHERE tenant_id = ?`, [req.params.id]);
    }
    await pool.query('DELETE FROM users WHERE tenant_id = ?', [req.params.id]);
    await pool.query('DELETE FROM tenants WHERE id = ?', [req.params.id]);
    await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    res.json({ message: 'Tienda eliminada' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webp-todas', async (req, res) => {
  try {
    const [tenants] = await pool.query('SELECT id FROM tenants');
    let totalFiles = 0, totalOk = 0, totalErr = 0;
    for (const t of tenants) {
      const dir = resolve(uploadBase, String(t.id));
      if (!existsSync(dir)) continue;
      const files = readdirSync(dir).filter(f => /\.(jpg|jpeg|png)$/i.test(f));
      totalFiles += files.length;
      for (const f of files) {
        try {
          const ruta = resolve(dir, f);
          const webpName = f.replace(/\.[^.]+$/, '.webp');
          const rutaWebp = resolve(dir, webpName);
          const { exec } = await import('child_process');
          const { promisify } = await import('util');
          await promisify(exec)(`convert "${ruta}" -auto-orient -quality 80% "${rutaWebp}"`);
          const oldUrl = `/multitienda/uploads/${t.id}/${f}`;
          const newUrl = `/multitienda/uploads/${t.id}/${webpName}`;
          await pool.query('UPDATE products SET image = ? WHERE tenant_id = ? AND image = ?', [newUrl, t.id, oldUrl]);
          await pool.query('UPDATE tenants SET logo = ? WHERE id = ? AND logo = ?', [newUrl, t.id, oldUrl]);
          const { unlinkSync } = await import('fs');
          unlinkSync(ruta);
          totalOk++;
        } catch { totalErr++; }
      }
    }
    res.json({ message: `${totalOk}/${totalFiles} convertidas a WebP, ${totalErr} errores, ${tenants.length} tiendas procesadas` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/upload-main-logo', (req, res) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadBase),
    filename: (req, file, cb) => cb(null, 'logo.png'),
  });
  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      cb(null, ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext));
    },
  }).single('logo');

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
    res.json({ message: 'Logo actualizado correctamente', url: '/multitienda/uploads/logo.png' });
  });
});

export default router;
