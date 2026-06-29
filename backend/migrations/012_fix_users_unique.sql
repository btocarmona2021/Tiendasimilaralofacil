ALTER TABLE users DROP INDEX username;
ALTER TABLE users ADD UNIQUE KEY uk_tenant_username (tenant_id, username);

INSERT INTO users (tenant_id, username, password_hash, role)
SELECT t.id, 'admin', '$2a$10$cwn0fBor/BzbIrRQ7GvQt.ZgvlBUg5D3C0R1ab5pDE5FG3IzyuEPC', 'admin'
FROM tenants t
WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.tenant_id = t.id AND u.role = 'admin');
