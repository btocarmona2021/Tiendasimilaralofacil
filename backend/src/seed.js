import bcrypt from 'bcryptjs';
import pool from './config/db.js';

const rubro = process.argv[2] || 'ferreteria';

const rubroSettings = {
  fiambres: {
    rubro: 'fiambres',
    store_name: 'A lo Fácil – Fiambres',
    rubro_label: 'Fiambrería',
    subtitle: 'Productos frescos · Pedidos por WhatsApp',
    promo: '🎉 Pedidos de lunes a sábado — Consultá disponibilidad y envío',
    whatsapp: '542934463759',
    currency: 'ARS',
    shipping_free: '25000',
    shipping_cost: '2000',
    info_hours: 'Lunes a Sábado · 8:00–13:00 / 17:00–21:00',
    info_phone: '',
    info_delivery: 'Consultá disponibilidad por zona',
    info_payment: 'Efectivo · Transferencia MP',
    mp_alias: '',
    mp_cvu: '',
    mp_holder: '',
    bank_entity: '',
    bank_cbu: '',
    bank_alias: '',
    bank_holder: '',
    theme_preset: 'fiambres',
  },
  ferreteria: {
    rubro: 'ferreteria',
    store_name: 'A lo Fácil – Ferretería',
    rubro_label: 'Ferretería',
    subtitle: 'Herramientas profesionales · Pedidos por WhatsApp',
    promo: '🔧 Envíos a toda la zona — Consultá precios mayoristas',
    whatsapp: '542934463759',
    currency: 'ARS',
    shipping_free: '50000',
    shipping_cost: '3000',
    info_hours: 'Lunes a Viernes · 8:00–18:00 / Sábados 8:00–13:00',
    info_phone: '',
    info_delivery: 'Consultá disponibilidad por zona',
    info_payment: 'Efectivo · Transferencia MP · Tarjeta',
    mp_alias: '',
    mp_cvu: '',
    mp_holder: '',
    bank_entity: '',
    bank_cbu: '',
    bank_alias: '',
    bank_holder: '',
    theme_preset: 'ferreteria',
  },
  verduleria: {
    rubro: 'verduleria',
    store_name: 'A lo Fácil – Verdulería',
    rubro_label: 'Verdulería',
    subtitle: 'Frutas y verduras frescas · Pedidos por WhatsApp',
    promo: '🥬 Productos de estación — Consultá disponibilidad y envío',
    whatsapp: '542934463759',
    currency: 'ARS',
    shipping_free: '15000',
    shipping_cost: '1500',
    info_hours: 'Lunes a Sábados · 7:00–20:00',
    info_phone: '',
    info_delivery: 'Consultá disponibilidad por zona',
    info_payment: 'Efectivo · Transferencia MP',
    mp_alias: '',
    mp_cvu: '',
    mp_holder: '',
    bank_entity: '',
    bank_cbu: '',
    bank_alias: '',
    bank_holder: '',
    theme_preset: 'verduleria',
  },
};

const seeds = {
  fiambres: {
    categories: [
      { name: 'Fiambres', slug: 'fiambres', icon: '🥩', sort_order: 1 },
      { name: 'Milanesas', slug: 'milanesas', icon: '🍗', sort_order: 2 },
      { name: 'Panadería', slug: 'panaderia', icon: '🍞', sort_order: 3 },
      { name: 'Pizzas', slug: 'pizzas', icon: '🍕', sort_order: 4 },
      { name: 'Sanguches', slug: 'sanguches', icon: '🥪', sort_order: 5 },
    ],
    products: [
      { cat: 'fiambres', name: 'Queso Sardo', price: 2300, unit: '100g', emoji: '🧀', desc: 'Queso duro de pasta cocida, ideal para rallar y fondues. Sabor intenso y textura firme.' },
      { cat: 'fiambres', name: 'Queso Cremoso Cremón', price: 1600, unit: '100g', emoji: '🧀', desc: 'Queso untable cremoso, suave y versátil. Perfecto para sándwiches y picadas.' },
      { cat: 'fiambres', name: 'Jamón Cocido', price: 2400, unit: '100g', emoji: '🍖', desc: 'Jamón cocido natural, jugoso y de calidad premium. Ideal para sándwiches y tablas.' },
      { cat: 'fiambres', name: 'Salame Milán Premium', price: 2900, unit: '100g', emoji: '🥓', desc: 'Salame tipo Milán elaborado artesanalmente con especias seleccionadas.' },
      { cat: 'fiambres', name: 'Jamón Crudo', price: 4400, unit: '100g', emoji: '🍖', desc: 'Jamón crudo curado, de sabor profundo y textura delicada. Ideal para pizzas y picadas.' },
      { cat: 'fiambres', name: 'Panceta Ahumada', price: 3900, unit: '100g', emoji: '🥓', desc: 'Panceta ahumada con leña de quebracho. Crujiente y llena de sabor.' },
      { cat: 'fiambres', name: 'Lomo Ahumado', price: 3500, unit: '100g', emoji: '🥩', desc: 'Lomo de cerdo ahumado, jugoso y tierno. Ideal para sándwiches gourmet.' },
      { cat: 'milanesas', name: 'Milanesa de Pollo (pechuga)', price: 10900, unit: 'kg', emoji: '🍗', desc: 'Milanesas de pechuga de pollo, empanadas Artesanalmente. Listas para freír u hornear.' },
      { cat: 'milanesas', name: 'Milanesa de Nalga', price: 23900, unit: 'kg', emoji: '🥩', desc: 'Milanesas de nalga de primera calidad, carne tierna y sabrosa.' },
      { cat: 'panaderia', name: 'Pan Lactal Chico', price: 4500, unit: 'unidad', emoji: '🍞', desc: 'Pan lactal artesanal, esponjoso y fresco. Horneado diariamente.' },
      { cat: 'pizzas', name: 'Pizza Muzzarella', price: 6500, unit: 'unidad', emoji: '🍕', desc: 'Pizza tradicional con muzzarella, salsa de tomate casera y orégano.' },
      { cat: 'pizzas', name: 'Pizza Jamón Crudo', price: 8500, unit: 'unidad', emoji: '🍕', desc: 'Pizza con jamón crudo, muzzarella y rúcula fresca. Una delicia única.' },
      { cat: 'sanguches', name: 'Jamón y Queso', price: 5000, unit: 'x3 u.', emoji: '🥪', desc: 'Sanguches de jamón cocido y queso cremoso en pan lactal fresco. x3 unidades.' },
    ],
    combos: [
      { name: 'Queso Barra + Jamón', desc: '1kg de Queso Barra + 1kg de Jamón Cocido', emoji: '🧀🍖', price: 29500 },
      { name: 'Picada x4 personas', desc: 'Salame + Jamón + Queso + Mortadela (1kg total)', emoji: '🫒', price: 22900 },
    ],
  },
  ferreteria: {
    categories: [
      { name: 'Herramientas Manuales', slug: 'hand-tools', icon: '🔧', sort_order: 1 },
      { name: 'Herramientas Eléctricas', slug: 'power-tools', icon: '⚡', sort_order: 2 },
      { name: 'Pinturería', slug: 'paint', icon: '🎨', sort_order: 3 },
      { name: 'Plomería', slug: 'plumbing', icon: '🔩', sort_order: 4 },
      { name: 'Fijaciones', slug: 'hardware', icon: '⚙️', sort_order: 5 },
    ],
    products: [
      { cat: 'hand-tools', name: 'Martillo de Carpintero 500g', price: 8900, unit: 'unidad', emoji: '🔨', desc: 'Martillo profesional con mango de fibra y cabeza forjada. Ideal para carpintería y construcción.' },
      { cat: 'hand-tools', name: 'Destornillador Plano 6mm', price: 3500, unit: 'unidad', emoji: '🪛', desc: 'Destornillador plano con mango ergonómico antideslizante y punta magnética.' },
      { cat: 'hand-tools', name: 'Pinza Universal 8"', price: 7200, unit: 'unidad', emoji: '🔧', desc: 'Pinza universal de acero al carbono con mango forrado. Corte y agarre precisos.' },
      { cat: 'hand-tools', name: 'Cinta Métrica 5m', price: 4800, unit: 'unidad', emoji: '📏', desc: 'Cinta métrica retráctil de 5 metros con cierre magnético y gancho de extremo.' },
      { cat: 'hand-tools', name: 'Nivel de Burbuja 60cm', price: 6500, unit: 'unidad', emoji: '📐', desc: 'Nivel de burbuja de aluminio de 60cm con 3 viales. Precisión profesional.' },
      { cat: 'power-tools', name: 'Taladro Percutor 650W', price: 45900, unit: 'unidad', emoji: '🔌', desc: 'Taladro percutor con velocidad variable, mandril autocargable y empuñadura auxiliar.' },
      { cat: 'power-tools', name: 'Amoladora Angular 4½"', price: 38900, unit: 'unidad', emoji: '⚡', desc: 'Amoladora angular potente con protección de sobrecarga y disco de corte incluido.' },
      { cat: 'power-tools', name: 'Atornillador Inalámbrico', price: 29900, unit: 'unidad', emoji: '🪫', desc: 'Atornillador inalámbrico a batería con cargador rápido y maletín de transporte.' },
      { cat: 'paint', name: 'Látex Interior 20L Blanco', price: 32500, unit: '20L', emoji: '🎨', desc: 'Látex interior mate premium. Cubritivo, lavable y de bajo olor. Color blanco nieve.' },
      { cat: 'paint', name: 'Esmalte Sintético 1L', price: 8500, unit: '1L', emoji: '🎨', desc: 'Esmalte sintético brillante para interiores y exteriores. Secado rápido y alta resistencia.' },
      { cat: 'plumbing', name: 'Caño PVC ½" x 3m', price: 5200, unit: '3m', emoji: '🔩', desc: 'Caño de PVC sanitario de ½ pulgada. Resistente, liviano y fácil de instalar.' },
      { cat: 'plumbing', name: 'Llave de Paso ½"', price: 6800, unit: 'unidad', emoji: '🔧', desc: 'Llave de paso esférica de ½ pulgada con cierre hermético y manija de aluminio.' },
      { cat: 'hardware', name: 'Bulones Allen M8 x30', price: 1500, unit: 'x10 u.', emoji: '⚙️', desc: 'Bulones Allen M8 x30mm en acero inoxidable. Incluye tuerca y arandela. x10 unidades.' },
    ],
    combos: [
      { name: 'Kit Básico Herramientas', desc: 'Martillo + Pinza + Destornillador + Cinta métrica', emoji: '🔧🛠️', price: 21900 },
      { name: 'Combo Pintor', desc: 'Látex 20L + Rodillo + Bandeja + Cinta de enmascarar', emoji: '🎨🖌️', price: 38900 },
    ],
  },
  verduleria: {
    categories: [
      { name: 'Frutas', slug: 'frutas', icon: '🍎', sort_order: 1 },
      { name: 'Verduras', slug: 'verduras', icon: '🥬', sort_order: 2 },
      { name: 'Huevos y Lácteos', slug: 'huevos', icon: '🥚', sort_order: 3 },
      { name: 'Almacén', slug: 'almacen', icon: '📦', sort_order: 4 },
    ],
    products: [
      { cat: 'frutas', name: 'Manzana Red Delicious', price: 1200, unit: 'kg', emoji: '🍎', desc: 'Manzana roja dulce y jugosa, perfecta para comer fresca o en ensaladas de fruta.' },
      { cat: 'frutas', name: 'Banana Ecuatoriana', price: 1400, unit: 'kg', emoji: '🍌', desc: 'Banana ecuatoriana de primera calidad, dulce y cremosa. Ideal para postres.' },
      { cat: 'frutas', name: 'Naranja Jugo', price: 900, unit: 'kg', emoji: '🍊', desc: 'Naranja jugosa y dulce, perfecta para exprimir. Rica en vitamina C.' },
      { cat: 'frutas', name: 'Frutilla', price: 3200, unit: 'kg', emoji: '🍓', desc: 'Frutillas frescas y dulces, seleccionadas a mano. Ideales para postres y ensaladas.' },
      { cat: 'verduras', name: 'Lechuga Fresca', price: 1100, unit: 'kg', emoji: '🥬', desc: 'Lechuga criolla fresca, cosechada del día. Crujiente y llena de sabor.' },
      { cat: 'verduras', name: 'Tomate Perita', price: 1800, unit: 'kg', emoji: '🍅', desc: 'Tomate perita maduro, ideal para ensaladas y salsas. Sabor natural intenso.' },
      { cat: 'verduras', name: 'Cebolla', price: 800, unit: 'kg', emoji: '🧅', desc: 'Cebolla blanca de primera calidad. Ideal para guisos, ensaladas y condimentos.' },
      { cat: 'verduras', name: 'Papa', price: 700, unit: 'kg', emoji: '🥔', desc: 'Papa fresca seleccionada. Perfecta para puré, frituras y guisos.' },
      { cat: 'huevos', name: 'Huevos Blancos x6', price: 3200, unit: 'x6 u.', emoji: '🥚', desc: 'Huevos blancos frescos de gallinas libres. Categoría A, x6 unidades.' },
      { cat: 'huevos', name: 'Leche Entera 1L', price: 1800, unit: '1L', emoji: '🥛', desc: 'Leche entera pasteurizada de primera calidad. Cremosa y nutritiva.' },
      { cat: 'almacen', name: 'Arroz 1kg', price: 2200, unit: 'kg', emoji: '📦', desc: 'Arroz largo fino, de grano perfecto. Ideal para guarniciones y ensaladas.' },
    ],
    combos: [
      { name: 'Bolsa de Frutas', desc: '5kg de frutas variadas de estación', emoji: '🍎🍊', price: 8900 },
      { name: 'Canasta Verde', desc: '7kg de verduras seleccionadas', emoji: '🥬🥕', price: 7500 },
    ],
  },
};

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
  for (const c of data.combos) {
    await pool.query(
      'INSERT INTO combos (name, description, emoji, price) VALUES (?, ?, ?, ?)',
      [c.name, c.desc, c.emoji, c.price]
    );
  }
  console.log(`✅ ${data.combos.length} combos creados`);

  const user = process.argv[3] || 'admin';
  const pass = process.argv[4] || 'admin123';
  const hash = await bcrypt.hash(pass, 10);
  await pool.query(
    'INSERT INTO users (username, password_hash) VALUES (?, ?) ON DUPLICATE KEY UPDATE password_hash=?',
    [user, hash, hash]
  );
  console.log(`✅ Usuario admin: ${user} / ${pass}`);

  await pool.end();
  console.log('🎉 Seed completado para rubro:', rubro);
}

seed().catch(err => {
  console.error('Error en seed:', err);
  process.exit(1);
});
