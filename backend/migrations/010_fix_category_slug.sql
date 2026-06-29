ALTER TABLE categories DROP INDEX IF EXISTS slug, ADD UNIQUE INDEX idx_cat_slug_tenant (tenant_id, slug);
ALTER TABLE discount_codes DROP INDEX IF EXISTS code, ADD UNIQUE INDEX idx_code_tenant (tenant_id, code);
