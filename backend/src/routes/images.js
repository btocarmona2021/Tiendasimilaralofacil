import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { comprimir, convertirAWebp, listarOptimizables } from '../services/imageOptimizer.js';

const router = Router();

router.post('/comprimir', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.body;
    const result = await comprimir(req.user.tenantId, filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webp', authMiddleware, async (req, res) => {
  try {
    const { filename } = req.body;
    const result = await convertirAWebp(req.user.tenantId, filename);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/comprimir-todas', authMiddleware, async (req, res) => {
  try {
    const files = await listarOptimizables(req.user.tenantId);
    let ok = 0, err = 0;
    for (const f of files) {
      try { await comprimir(req.user.tenantId, f); ok++; }
      catch { err++; }
    }
    res.json({ message: `${ok} comprimidas, ${err} errores` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/webp-todas', authMiddleware, async (req, res) => {
  try {
    const files = await listarOptimizables(req.user.tenantId);
    let ok = 0, err = 0;
    for (const f of files) {
      try { await convertirAWebp(req.user.tenantId, f); ok++; }
      catch { err++; }
    }
    res.json({ message: `${ok} convertidas a WebP, ${err} errores` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/listar', authMiddleware, async (req, res) => {
  try {
    const files = await listarOptimizables(req.user.tenantId);
    res.json({ files, total: files.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
