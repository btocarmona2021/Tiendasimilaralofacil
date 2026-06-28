import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import config from './config/env.js';
import pool from './config/db.js';

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/shop/api/products', productsRouter);
app.use('/shop/api/categories', categoriesRouter);
app.use('/shop/api/combos', combosRouter);
app.use('/shop/api/orders', ordersRouter);
app.use('/shop/api/auth', authRouter);
app.use('/shop/api/customers', customersRouter);
app.use('/shop/api/discount-codes', discountsRouter);
app.use('/shop/api/reviews', reviewsRouter);
app.use('/shop/api/settings', settingsRouter);
app.use('/shop/api/mercadopago', mercadopagoRouter);
app.use('/shop/api/upload', uploadRouter);

app.get('/shop/api/config', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT `key`, `value` FROM store_settings');
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    settings.shipping_free = Number(settings.shipping_free) || 25000;
    settings.shipping_cost = Number(settings.shipping_cost) || 2000;
    res.json(settings);
  } catch {
    res.json({});
  }
});

app.use('/shop/uploads', express.static(resolve(__dirname, '../uploads')));
app.use('/shop', express.static(resolve(__dirname, '../public')));

app.get('/shop/*', (req, res) => {
  res.sendFile(resolve(__dirname, '../public/index.html'));
});

app.listen(config.port, () => {
  console.log(`Servidor corriendo en puerto ${config.port}`);
});
