export function superAdminMiddleware(req, res, next) {
  if (req.user?.role !== 'super_admin') {
    return res.status(403).json({ error: 'Solo el super admin puede realizar esta acción' });
  }
  next();
}
