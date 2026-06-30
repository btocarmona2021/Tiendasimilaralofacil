import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import pool from './config/db.js';
import { MercadoPagoConfig, Payment } from 'mercadopago';

import { tenantMiddleware } from './middleware/tenant.js';
import productsRouter from './routes/products.js';
import categoriesRouter from './routes/categories.js';
import combosRouter from './routes/combos.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import customersRouter from './routes/customers.js';
import discountsRouter from './routes/discounts.js';
import reviewsRouter from './routes/reviews.js';
import settingsRouter from './routes/settings.js';
import mercadopagoRouter from './routes/mercadopago.js';
import uploadRouter from './routes/upload.js';
import adminUsersRouter from './routes/adminUsers.js';
import adminSystemRouter from './routes/adminSystem.js';
import planesRouter from './routes/planes.js';
import pagosPlanesRouter from './routes/pagosPlanes.js';
import imagesRouter from './routes/images.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/multitienda/api/auth', authRouter);
app.use('/multitienda/:tenant/api/auth', tenantMiddleware, authRouter);

app.post('/multitienda/api/mercadopago/webhook', async (req, res) => {
  res.sendStatus(200);
  try {
    const type = req.body?.type || req.query?.topic || req.query?.type;
    const data = req.body?.data || {};
    let paymentId = data?.id || req.body?.id || req.query?.id || req.body?.resource?.id;
    if (type === 'payment' || type === 'merchant_order' || req.query?.topic === 'payment') {
      const client = new MercadoPagoConfig({ accessToken: config.mercadopagoToken, options: { timeout: 5000 } });
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      const externalRef = paymentData.external_reference;
      let orderId = null;
      if (externalRef) { try { const ref = JSON.parse(externalRef); orderId = ref.order_id; } catch {} }
      if (orderId) {
        await pool.query('UPDATE orders SET mp_payment_id = ?, mp_status = ?, status = ? WHERE id = ?',
          [String(paymentId), paymentData.status, paymentData.status === 'approved' ? 'confirmado' : 'pendiente', orderId]);
      }
    }
  } catch {}
});
app.get('/multitienda/api/mercadopago/webhook', (req, res) => res.sendStatus(200));

app.post('/multitienda/:tenant/api/mercadopago/webhook', tenantMiddleware, async (req, res) => {
  res.sendStatus(200);
  try {
    const accessToken = req.tenant?.mp_access_token;
    if (!accessToken) return;
    const type = req.body?.type || req.query?.topic || req.query?.type;
    const data = req.body?.data || {};
    let paymentId = data?.id || req.body?.id || req.query?.id || req.body?.resource?.id;
    if (type === 'payment' || type === 'merchant_order' || req.query?.topic === 'payment') {
      const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
      const payment = new Payment(client);
      const paymentData = await payment.get({ id: paymentId });
      const externalRef = paymentData.external_reference;
      let orderId = null;
      if (externalRef) { try { const ref = JSON.parse(externalRef); orderId = ref.order_id; } catch {} }
      if (orderId) {
        await pool.query('UPDATE orders SET mp_payment_id = ?, mp_status = ?, status = ? WHERE id = ?',
          [String(paymentId), paymentData.status, paymentData.status === 'approved' ? 'confirmado' : 'pendiente', orderId]);
      }
    }
  } catch {}
});
app.get('/multitienda/:tenant/api/mercadopago/webhook', (req, res) => res.sendStatus(200));

app.use('/multitienda/api/admin/users', adminUsersRouter);
app.use('/multitienda/api/admin/system', adminSystemRouter);
app.use('/multitienda/:tenant/api/admin/users', tenantMiddleware, adminUsersRouter);
app.use('/multitienda/:tenant/api/admin/system', tenantMiddleware, adminSystemRouter);
app.use('/multitienda/api/admin/planes', planesRouter);
app.use('/multitienda/:tenant/api/admin/planes', tenantMiddleware, planesRouter);
app.use('/multitienda/api/pagos-planes', pagosPlanesRouter);
app.use('/multitienda/:tenant/api/pagos-planes', tenantMiddleware, pagosPlanesRouter);
app.use('/multitienda/:tenant/api/images', tenantMiddleware, imagesRouter);

app.use('/multitienda/:tenant/api/products', tenantMiddleware, productsRouter);
app.use('/multitienda/:tenant/api/categories', tenantMiddleware, categoriesRouter);
app.use('/multitienda/:tenant/api/combos', tenantMiddleware, combosRouter);
app.use('/multitienda/:tenant/api/orders', tenantMiddleware, ordersRouter);
app.use('/multitienda/:tenant/api/customers', tenantMiddleware, customersRouter);
app.use('/multitienda/:tenant/api/discount-codes', tenantMiddleware, discountsRouter);
app.use('/multitienda/:tenant/api/reviews', tenantMiddleware, reviewsRouter);
app.use('/multitienda/:tenant/api/settings', tenantMiddleware, settingsRouter);
app.use('/multitienda/:tenant/api/mercadopago', tenantMiddleware, mercadopagoRouter);
app.use('/multitienda/:tenant/api/upload', tenantMiddleware, uploadRouter);

app.get('/multitienda/:tenant/api/config', tenantMiddleware, async (req, res) => {
  try {
    const t = req.tenant;
    res.json({
      store_name: t.store_name,
      logo: t.logo,
      rubro: t.rubro,
      rubro_label: t.rubro_label,
      subtitle: t.subtitle,
      promo: t.promo,
      whatsapp: t.whatsapp,
      shipping_free: Number(t.shipping_free),
      shipping_cost: Number(t.shipping_cost),
      info_hours: t.info_hours,
      info_phone: t.info_phone,
      info_delivery: t.info_delivery,
      info_payment: t.info_payment,
      mp_alias: t.mp_alias,
      mp_cvu: t.mp_cvu,
      mp_holder: t.mp_holder,
      mp_access_token: t.mp_access_token,
      bank_entity: t.bank_entity,
      bank_cbu: t.bank_cbu,
      bank_alias: t.bank_alias,
      bank_holder: t.bank_holder,
    });
  } catch { res.json({}); }
});

app.use('/multitienda/seed-images', express.static(resolve(__dirname, '../seed-assets/images')));
app.use('/multitienda/uploads', express.static(resolve(__dirname, '../uploads')));
app.use('/multitienda', express.static(resolve(__dirname, '../public')));

app.get('/multitienda/api/tiendas', async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT slug, store_name, rubro, rubro_label, logo, subtitle FROM tenants WHERE is_active = TRUE ORDER BY store_name"
    );
    res.json(rows);
  } catch { res.json([]); }
});

app.get('/multitienda/*', (req, res) => {
  if (!req.path.startsWith('/multitienda/api/')) {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  res.sendFile(resolve(__dirname, '../public/index.html'));
});

app.listen(config.port, () => {
  console.log(`Servidor corriendo en puerto ${config.port}`);
});
