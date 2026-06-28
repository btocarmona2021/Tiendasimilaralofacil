ALTER TABLE users ADD COLUMN role ENUM('super_admin', 'admin') NOT NULL DEFAULT 'admin';
