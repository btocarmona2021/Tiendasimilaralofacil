import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, '../../.env') });

export default {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'mysql',
    user: process.env.DB_USER || 'tienda_user',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'tienda_alofacil',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  mercadopagoToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
};
