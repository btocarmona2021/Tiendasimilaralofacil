import { Router } from 'express';
import multer from 'multer';
import { resolve, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { authMiddleware } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseUploadDir = resolve(__dirname, '../../uploads');

const router = Router();

router.post('/', authMiddleware, (req, res) => {
  const tenantDir = resolve(baseUploadDir, String(req.tenantId || '0'));
  if (!existsSync(tenantDir)) mkdirSync(tenantDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, tenantDir),
    filename: (req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      const name = `${Date.now()}-${Math.round(Math.random() * 999)}${ext}`;
      cb(null, name);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
      const ext = extname(file.originalname).toLowerCase();
      cb(null, allowed.includes(ext));
    },
  }).single('image');

  upload(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: 'No se subió ninguna imagen' });
    res.json({ url: `/multitienda/uploads/${req.tenantId}/${req.file.filename}` });
  });
});

export default router;
