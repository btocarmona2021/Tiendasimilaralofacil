CREATE TABLE IF NOT EXISTS planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(50) NOT NULL UNIQUE,
  nombre VARCHAR(100) NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0,
  limite_productos INT NOT NULL DEFAULT 10,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO planes (slug, nombre, precio, limite_productos, activo) VALUES
  ('basico', 'Básico', 0, 10, TRUE),
  ('estandar', 'Estándar', 9999, 50, TRUE),
  ('premium', 'Premium', 24999, 9999, TRUE)
ON DUPLICATE KEY UPDATE nombre=VALUES(nombre), precio=VALUES(precio), limite_productos=VALUES(limite_productos);

ALTER TABLE tenants ADD COLUMN plan_id INT DEFAULT NULL AFTER rubro_label, ADD INDEX idx_tenants_plan (plan_id);
ALTER TABLE tenants ADD COLUMN fecha_vencimiento DATE DEFAULT NULL AFTER plan_id;
