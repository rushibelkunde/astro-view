-- Patch v2: Role-Permission Refactor

-- 1. Create features table
CREATE TABLE IF NOT EXISTS features (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, code)
);
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS features_tenant_policy ON features;
CREATE POLICY features_tenant_policy ON features USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- 2. Populate features table from existing domain knowledge
-- In a real migration, we'd do this via code, but for now we can seed standard ones.
-- Note: This is tricky with tenant_id, so we'll likely handle feature creation in the repository.

-- 3. Refactor permissions table
-- First, drop depends-on table
DROP TABLE IF EXISTS permissions CASCADE;

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    feature_id UUID NOT NULL REFERENCES features(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, execute
    conditions JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(feature_id, action)
);
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissions_tenant_policy ON permissions;
CREATE POLICY permissions_tenant_policy ON permissions USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- 4. Create role_permissions join table
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    PRIMARY KEY(role_id, permission_id)
);
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS role_permissions_tenant_policy ON role_permissions;
CREATE POLICY role_permissions_tenant_policy ON role_permissions USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);
