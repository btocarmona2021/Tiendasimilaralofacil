ALTER TABLE orders ADD COLUMN payment_method ENUM('whatsapp', 'mercadopago') NOT NULL DEFAULT 'whatsapp' AFTER notes;
ALTER TABLE orders ADD COLUMN mp_preference_id VARCHAR(100) DEFAULT NULL AFTER payment_method;
ALTER TABLE orders ADD COLUMN mp_payment_id VARCHAR(100) DEFAULT NULL AFTER mp_preference_id;
ALTER TABLE orders ADD COLUMN mp_status VARCHAR(50) DEFAULT NULL AFTER mp_payment_id;