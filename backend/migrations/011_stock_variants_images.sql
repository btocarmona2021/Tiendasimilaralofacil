ALTER TABLE products ADD COLUMN stock INT NOT NULL DEFAULT -1 AFTER price;
ALTER TABLE products ADD COLUMN variantes VARCHAR(500) DEFAULT NULL AFTER stock;

CREATE TABLE IF NOT EXISTS product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  tenant_id INT NOT NULL,
  url VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_pi_product (product_id),
  INDEX idx_pi_tenant (tenant_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
