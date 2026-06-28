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
      { name: 'Jardinería', slug: 'garden', icon: '🌿', sort_order: 6 },
    ],
    products: [
      { cat: 'hand-tools', name: 'Martillo de Carpintero 500g', price: 8900, unit: 'unidad', emoji: '🔨', desc: 'Martillo profesional con mango de fibra y cabeza forjada. Ideal para carpintería y construcción.' },
      { cat: 'hand-tools', name: 'Martillo de Uña 300g', price: 6500, unit: 'unidad', emoji: '🔨', desc: 'Martillo de uña liviano, perfecto para tareas de precisión y extracción de clavos.' },
      { cat: 'hand-tools', name: 'Destornillador Plano 6mm', price: 3500, unit: 'unidad', emoji: '🪛', desc: 'Destornillador plano con mango ergonómico antideslizante y punta magnética.' },
      { cat: 'hand-tools', name: 'Destornillador Phillips #2', price: 3500, unit: 'unidad', emoji: '🪛', desc: 'Destornillador Phillips de punta magnética con mango bi-material antideslizante.' },
      { cat: 'hand-tools', name: 'Pinza Universal 8"', price: 7200, unit: 'unidad', emoji: '🔧', desc: 'Pinza universal de acero al carbono con mango forrado. Corte y agarre precisos.' },
      { cat: 'hand-tools', name: 'Pinza de Corte 7"', price: 6800, unit: 'unidad', emoji: '✂️', desc: 'Pinza de corte diagonal para cables y alambres. Acero templado con filo preciso.' },
      { cat: 'hand-tools', name: 'Cinta Métrica 5m', price: 4800, unit: 'unidad', emoji: '📏', desc: 'Cinta métrica retráctil de 5 metros con cierre magnético y gancho de extremo.' },
      { cat: 'hand-tools', name: 'Cinta Métrica 8m', price: 7200, unit: 'unidad', emoji: '📏', desc: 'Cinta métrica profesional de 8 metros con doble escala métrica/pulgadas.' },
      { cat: 'hand-tools', name: 'Nivel de Burbuja 60cm', price: 6500, unit: 'unidad', emoji: '📐', desc: 'Nivel de burbuja de aluminio de 60cm con 3 viales. Precisión profesional.' },
      { cat: 'hand-tools', name: 'Nivel de Burbuja 120cm', price: 10800, unit: 'unidad', emoji: '📐', desc: 'Nivel de aluminio de 120cm con viales reforzados. Ideal para obras y construcción.' },
      { cat: 'hand-tools', name: 'Llave Inglesa 10"', price: 9500, unit: 'unidad', emoji: '🔧', desc: 'Llave inglesa ajustable con boca templada y mango antideslizante. Apertura hasta 30mm.' },
      { cat: 'hand-tools', name: 'Juego de Llaves Allen', price: 4800, unit: 'x9 u.', emoji: '🔧', desc: 'Set de llaves Allen milimétricas de 1.5 a 10mm. Acero al cromo vanadio con estuche.' },
      { cat: 'power-tools', name: 'Taladro Percutor 650W', price: 45900, unit: 'unidad', emoji: '🔌', desc: 'Taladro percutor con velocidad variable, mandril autocargable y empuñadura auxiliar.' },
      { cat: 'power-tools', name: 'Taladro Inalámbrico 12V', price: 38900, unit: 'unidad', emoji: '🪫', desc: 'Taladro inalámbrico con batería de 12V, cargador rápido y maletín de transporte.' },
      { cat: 'power-tools', name: 'Amoladora Angular 4½"', price: 38900, unit: 'unidad', emoji: '⚡', desc: 'Amoladora angular potente con protección de sobrecarga y disco de corte incluido.' },
      { cat: 'power-tools', name: 'Amoladora Angular 7"', price: 52900, unit: 'unidad', emoji: '⚡', desc: 'Amoladora angular profesional de 7 pulgadas con empuñadura lateral y guarda regulable.' },
      { cat: 'power-tools', name: 'Atornillador Inalámbrico', price: 29900, unit: 'unidad', emoji: '🪫', desc: 'Atornillador inalámbrico a batería con cargador rápido y maletín de transporte.' },
      { cat: 'power-tools', name: 'Caladora Eléctrica 500W', price: 28500, unit: 'unidad', emoji: '🔪', desc: 'Caladora con velocidad variable, corte orbital y guía láser para cortes precisos.' },
      { cat: 'power-tools', name: 'Lijadora Orbital 300W', price: 25900, unit: 'unidad', emoji: '🪵', desc: 'Lijadora orbital con sistema de extracción de polvo y velcro para cambios rápidos de lija.' },
      { cat: 'power-tools', name: 'Hidrolavadora 120bar', price: 45900, unit: 'unidad', emoji: '💦', desc: 'Hidrolavadora de 120 bares con manguera de 8m, lanza regulable y boquilla turbo.' },
      { cat: 'paint', name: 'Látex Interior 20L Blanco', price: 32500, unit: '20L', emoji: '🎨', desc: 'Látex interior mate premium. Cubritivo, lavable y de bajo olor. Color blanco nieve.' },
      { cat: 'paint', name: 'Látex Interior 4L Blanco', price: 8500, unit: '4L', emoji: '🎨', desc: 'Látex interior mate con alto poder cubritivo. Ideal para paredes y techos.' },
      { cat: 'paint', name: 'Esmalte Sintético 1L Blanco', price: 8500, unit: '1L', emoji: '🎨', desc: 'Esmalte sintético brillante para interiores y exteriores. Secado rápido y alta resistencia.' },
      { cat: 'paint', name: 'Esmalte Sintético 1L Negro', price: 8500, unit: '1L', emoji: '🎨', desc: 'Esmalte sintético brillante color negro. Ideal para rejas, muebles y herrería en general.' },
      { cat: 'paint', name: 'Barniz Marino 1L', price: 12500, unit: '1L', emoji: '🎨', desc: 'Barniz marino transparente con filtro UV. Protege maderas a la intemperie.' },
      { cat: 'paint', name: 'Enduido Plástico 1kg', price: 4500, unit: 'kg', emoji: '🧴', desc: 'Enduido plástico para paredes. Secado rápido, fácil de lijar. Ideal para interiores.' },
      { cat: 'paint', name: 'Rodillo Profesional 23cm', price: 3200, unit: 'unidad', emoji: '🖌️', desc: 'Rodillo de felpa profesional 23cm con mango telescópico. Para pintar superficies lisas.' },
      { cat: 'plumbing', name: 'Caño PVC ½" x 3m', price: 5200, unit: '3m', emoji: '🔩', desc: 'Caño de PVC sanitario de ½ pulgada. Resistente, liviano y fácil de instalar.' },
      { cat: 'plumbing', name: 'Caño PVC 1" x 3m', price: 7800, unit: '3m', emoji: '🔩', desc: 'Caño de PVC sanitario de 1 pulgada para instalaciones de mayor caudal.' },
      { cat: 'plumbing', name: 'Llave de Paso ½"', price: 6800, unit: 'unidad', emoji: '🔧', desc: 'Llave de paso esférica de ½ pulgada con cierre hermético y manija de aluminio.' },
      { cat: 'plumbing', name: 'Llave de Paso ¾"', price: 8200, unit: 'unidad', emoji: '🔧', desc: 'Llave de paso esférica de ¾ para instalaciones de agua corriente.' },
      { cat: 'plumbing', name: 'Codo PVC ½" x45°', price: 600, unit: 'unidad', emoji: '🔩', desc: 'Codo de PVC sanitario de ½ pulgada a 45 grados. Para desagües y ventilaciones.' },
      { cat: 'plumbing', name: 'Adaptador PVC ½"', price: 400, unit: 'unidad', emoji: '🔩', desc: 'Adaptador de PVC hembra-macho de ½ pulgada. Conexión rápida y segura.' },
      { cat: 'plumbing', name: 'Teflón 18mts', price: 1200, unit: 'unidad', emoji: '🧵', desc: 'Cinta de teflón para sellado de roscas. 18 metros de largo, uso sanitario y gas.' },
      { cat: 'plumbing', name: 'Sifón PVC 1¼"', price: 3500, unit: 'unidad', emoji: '🔩', desc: 'Sifón de PVC para bacha de cocina con salida a 1¼ pulgada. Incluye juntas.' },
      { cat: 'hardware', name: 'Bulones Allen M8 x30', price: 1500, unit: 'x10 u.', emoji: '⚙️', desc: 'Bulones Allen M8 x30mm en acero inoxidable. Incluye tuerca y arandela. x10 unidades.' },
      { cat: 'hardware', name: 'Tornillos Madera 4"', price: 2200, unit: 'x20 u.', emoji: '⚙️', desc: 'Tornillos para madera de 4 pulgadas con cabeza fresada. Acero galvanizado. x20 unidades.' },
      { cat: 'hardware', name: 'Tarugos N°8 x25', price: 800, unit: 'x12 u.', emoji: '⚙️', desc: 'Tarugos de expansión N°8 con tornillos incluidos. Ideal para paredes de ladrillo y hormigón.' },
      { cat: 'hardware', name: 'Arandelas Planas M8', price: 400, unit: 'x20 u.', emoji: '⭕', desc: 'Arandelas planas M8 en acero inoxidable. x20 unidades.' },
      { cat: 'hardware', name: 'Gancho Tornillo 6mm', price: 900, unit: 'x5 u.', emoji: '🪝', desc: 'Gancho con rosca de 6mm para colgar cuadros, estantes y decoración. x5 unidades.' },
      { cat: 'garden', name: 'Manguera Jardín 15m', price: 12500, unit: '15m', emoji: '🌿', desc: 'Manguera de PVC reforzado de 15 metros con acoples plásticos. Resistente a rayos UV.' },
      { cat: 'garden', name: 'Pulverizador 2L', price: 5800, unit: 'unidad', emoji: '🌿', desc: 'Pulverizador manual de 2 litros con boquilla regulable. Ideal para regar y fumigar.' },
      { cat: 'garden', name: 'Tijera de Podar 8"', price: 7900, unit: 'unidad', emoji: '✂️', desc: 'Tijera de podar con hojas de acero templado y mango ergonómico. Corte limpio y preciso.' },
      { cat: 'garden', name: 'Rastrillo Metálico 30cm', price: 5200, unit: 'unidad', emoji: '🌿', desc: 'Rastrillo de acero con mango de madera de 30cm. Ideal para jardinería y limpieza.' },
      { cat: 'garden', name: 'Guantes Jardinería', price: 3800, unit: 'par', emoji: '🧤', desc: 'Guantes de jardinería con palma de látex antideslizante. Protegen espinas y humedad.' },
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
