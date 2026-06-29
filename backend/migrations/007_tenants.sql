CREATE TABLE IF NOT EXISTS tenants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  rubro VARCHAR(50) NOT NULL DEFAULT 'ferreteria',
  store_name VARCHAR(200) NOT NULL,
  rubro_label VARCHAR(100),
  subtitle VARCHAR(255),
  promo TEXT,
  whatsapp VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'ARS',
  shipping_free DECIMAL(10,2) DEFAULT 25000,
  shipping_cost DECIMAL(10,2) DEFAULT 2000,
  info_hours TEXT,
  info_phone VARCHAR(50),
  info_delivery TEXT,
  info_payment TEXT,
  mp_alias VARCHAR(100),
  mp_cvu VARCHAR(100),
  mp_holder VARCHAR(200),
  bank_entity VARCHAR(200),
  bank_cbu VARCHAR(100),
  bank_alias VARCHAR(100),
  bank_holder VARCHAR(200),
  theme_preset VARCHAR(50),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE categories ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_categories_tenant (tenant_id);
ALTER TABLE products ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_products_tenant (tenant_id);
ALTER TABLE combos ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_combos_tenant (tenant_id);
ALTER TABLE combo_products ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_combo_products_tenant (tenant_id);
ALTER TABLE orders ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_orders_tenant (tenant_id);
ALTER TABLE order_items ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_order_items_tenant (tenant_id);
ALTER TABLE order_combos ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_order_combos_tenant (tenant_id);
ALTER TABLE reviews ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_reviews_tenant (tenant_id);
ALTER TABLE customers ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_customers_tenant (tenant_id);
ALTER TABLE discount_codes ADD COLUMN tenant_id INT NOT NULL AFTER id, ADD INDEX idx_discount_codes_tenant (tenant_id);
ALTER TABLE users ADD COLUMN tenant_id INT DEFAULT NULL AFTER id, ADD INDEX idx_users_tenant (tenant_id);
