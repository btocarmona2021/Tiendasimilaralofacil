import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const migrations = ['001_init.sql', '002_payments.sql', '003_products_image.sql', '004_review_tokens.sql', '005_combo_products.sql', '006_super_admin.sql', '007_tenants.sql', '008_planes_subscriptions.sql', '009_pagos_planes.sql', '010_fix_category_slug.sql', '011_stock_variants_images.sql', '012_fix_users_unique.sql'];

for (const file of migrations) {
  const sql = readFileSync(resolve(__dirname, `../migrations/${file}`), 'utf8');

  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  try {
    for (const stmt of statements) {
      await pool.query(stmt);
    }
    console.log(`✓ ${file}`);
  } catch (err) {
    console.error(`Error en ${file}: ${err.message}`);
  }
}

console.log('Migraciones ejecutadas correctamente.');
await pool.end();
