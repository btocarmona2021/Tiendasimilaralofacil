import bcrypt from 'bcryptjs';
import pool from './config/db.js';
import { rubroSettings, seeds } from './seedData.js';

const rubro = process.argv[2] || 'ferreteria';
const user = process.argv[3] || 'admin';
const pass = process.argv[4] || 'admin123';

const SUPER_ADMIN_PASS = process.env.SUPER_ADMIN_PASSWORD || 'root123';

async function seed() {
  const settings = rubroSettings[rubro] || rubroSettings.ferreteria;
  const data = seeds[rubro] || seeds.ferreteria;

  for (const [key, value] of Object.entries(settings)) {
    await pool.query(
      'INSERT INTO store_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = ?',
      [key, String(value), String(value)]
    );
  }
  console.log(`✅ ${Object.keys(settings).length} settings guardados para rubro: ${rubro}`);

  for (const cat of data.categories) {
    await pool.query(
      'INSERT INTO categories (name, slug, icon, sort_order) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=name',
      [cat.name, cat.slug, cat.icon, cat.sort_order]
    );
  }
  console.log(`✅ ${data.categories.length} categorías creadas`);

  const catMap = {};
  const [rows] = await pool.query('SELECT id, slug FROM categories');
  rows.forEach(r => { catMap[r.slug] = r.id; });

  await pool.query('DELETE FROM products');
  for (const p of data.products) {
    const catId = catMap[p.cat];
    if (!catId) continue;
    await pool.query(
      'INSERT INTO products (category_id, name, description, price, unit, emoji) VALUES (?, ?, ?, ?, ?, ?)',
      [catId, p.name, p.desc || null, p.price, p.unit, p.emoji]
    );
  }
  console.log(`✅ ${data.products.length} productos creados`);

  await pool.query('DELETE FROM combos');
  await pool.query('DELETE FROM combo_products');
  for (const c of data.combos) {
    const [result] = await pool.query(
      'INSERT INTO combos (name, description, emoji, price) VALUES (?, ?, ?, ?)',
      [c.name, c.desc, c.emoji, c.price]
    );
    if (c.products && c.products.length > 0) {
      const [prods] = await pool.query('SELECT id, name FROM products WHERE name IN (?)', [c.products]);
      const values = prods.map(p => [result.insertId, p.id]);
      if (values.length > 0) {
        await pool.query('INSERT INTO combo_products (combo_id, product_id) VALUES ?', [values]);
      }
    }
  }
  console.log(`✅ ${data.combos.length} combos creados`);

  const reviews = [
    { name: 'María López', rating: 5, text: 'Excelente atención y productos de primera calidad. Ya hice varios pedidos y siempre todo perfecto. Muy recomendable.' },
    { name: 'Carlos Méndez', rating: 5, text: 'Las herramientas son muy buenas y los precios competitivos. El envío llegó súper rápido.' },
    { name: 'Julián Ríos', rating: 4, text: 'Buena variedad de productos, encontré todo lo que necesitaba para mi obra. Volveré a comprar.' },
    { name: 'Ana Paula Gómez', rating: 5, text: 'Me encanta la calidad de los productos frescos. Siempre llegan en perfecto estado y en tiempo.' },
    { name: 'Pedro Martínez', rating: 4, text: 'Muy buena atención, me asesoraron bien para elegir la pintura correcta. El resultado excelente.' },
    { name: 'Sofía Ramírez', rating: 5, text: 'Descubrí esta tienda por recomendación y no me arrepiento. Productos de calidad y precio justo.' },
    { name: 'Luis Fernández', rating: 4, text: 'Compré un taladro y funcionó perfecto. Buena relación precio-calidad. Lo recomiendo.' },
    { name: 'Camila Torres', rating: 5, text: 'La verdulería tiene frutas y verduras fresquísimas. El combo semanal me salva la vida.' },
    { name: 'Martín Díaz', rating: 3, text: 'Los productos están bien pero la página a veces se traba un poco. Por lo demás todo ok.' },
    { name: 'Valentina Castro', rating: 5, text: 'Excelente servicio, los fiambres son de primera. El jamón crudo es espectacular. Súper recomendado.' },
  ];
  await pool.query('DELETE FROM reviews');
  for (const r of reviews) {
    await pool.query(
      'INSERT INTO reviews (customer_name, rating, text, is_approved) VALUES (?, ?, ?, TRUE)',
      [r.name, r.rating, r.text]
    );
  }
  console.log(`✅ ${reviews.length} reseñas de ejemplo creadas`);

  const hash = await bcrypt.hash(pass, 10);
  await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash=?, role=?',
    [user, hash, 'admin', hash, 'admin']
  );
  console.log(`✅ Usuario admin: ${user} / ${pass}`);

  const rootHash = await bcrypt.hash(SUPER_ADMIN_PASS, 10);
  await pool.query(
    'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE password_hash=?, role=?',
    ['root', rootHash, 'super_admin', rootHash, 'super_admin']
  );
  console.log(`✅ Super admin: root / ${SUPER_ADMIN_PASS}`);

  await pool.end();
  console.log('🎉 Seed completado para rubro:', rubro);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
