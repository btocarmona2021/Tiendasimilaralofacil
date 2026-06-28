import pool from './config/db.js';

const TABLES = ['order_combos', 'order_items', 'orders', 'combo_products', 'combos', 'products', 'categories', 'reviews', 'discount_codes', 'customers', 'store_settings'];

async function clean() {
  console.log('🧹 Limpiando todas las tablas de datos...');
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  for (const table of TABLES) {
    await pool.query(`DELETE FROM ${table}`);
    console.log(`  ✗ ${table} vaciada`);
  }
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
  console.log('✅ Limpieza completada. Los usuarios admin se conservan.');
  await pool.end();
}

clean().catch(err => {
  console.error('Error en clean:', err);
  process.exit(1);
});
