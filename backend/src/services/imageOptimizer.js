import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, unlinkSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pool from '../config/db.js';

const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadBase = resolve(__dirname, '../../uploads');

export async function comprimir(tenantId, filename) {
  const ruta = resolve(uploadBase, String(tenantId), filename);
  if (!existsSync(ruta)) throw new Error('Archivo no encontrado');
  const tmp = ruta + '.tmp';
  await execAsync(`convert "${ruta}" -auto-orient -quality 80% "${tmp}" && mv "${tmp}" "${ruta}"`);
  const { stdout } = await execAsync(`ls -la "${ruta}" | awk '{print $5}'`);
  return { archivo: filename, tamano: parseInt(stdout.trim()) };
}

export async function convertirAWebp(tenantId, filename) {
  const ruta = resolve(uploadBase, String(tenantId), filename);
  if (!existsSync(ruta)) throw new Error('Archivo no encontrado');

  const ext = filename.toLowerCase().split('.').pop();
  if (!['jpg', 'jpeg', 'png'].includes(ext)) throw new Error('Formato no soportado. Solo JPG y PNG.');

  const webpName = filename.replace(/\.[^.]+$/, '.webp');
  const rutaWebp = resolve(uploadBase, String(tenantId), webpName);

  await execAsync(`convert "${ruta}" -auto-orient -quality 80% "${rutaWebp}"`);

  const oldUrl = `/multitienda/uploads/${tenantId}/${filename}`;
  const newUrl = `/multitienda/uploads/${tenantId}/${webpName}`;
  await pool.query('UPDATE products SET image = ? WHERE tenant_id = ? AND image = ?', [newUrl, tenantId, oldUrl]);
  await pool.query('UPDATE tenants SET logo = ? WHERE id = ? AND logo = ?', [newUrl, tenantId, oldUrl]);

  unlinkSync(ruta);

  const { stdout } = await execAsync(`ls -la "${rutaWebp}" | awk '{print $5}'`);
  return { archivo_original: filename, archivo_webp: webpName, tamano: parseInt(stdout.trim()) };
}

export async function listarOptimizables(tenantId) {
  const dir = resolve(uploadBase, String(tenantId));
  if (!existsSync(dir)) return [];
  const { stdout } = await execAsync(`ls -1 "${dir}" 2>/dev/null | grep -i -E "\.(jpg|jpeg|png)$" || true`);
  return stdout.trim().split('\n').filter(Boolean);
}
