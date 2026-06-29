CREATE TABLE IF NOT EXISTS pagos_planes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL,
  plan_id INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago ENUM('mercadopago','manual','transferencia') NOT NULL DEFAULT 'mercadopago',
  mp_preference_id VARCHAR(100) DEFAULT NULL,
  mp_payment_id VARCHAR(100) DEFAULT NULL,
  mp_status VARCHAR(50) DEFAULT NULL,
  estado ENUM('pendiente','aprobado','rechazado','cancelado') NOT NULL DEFAULT 'pendiente',
  registrado_por INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (plan_id) REFERENCES planes(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
