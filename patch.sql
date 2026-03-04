-- Patch to add missing RBAC tables

CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_tenant_policy ON roles;
CREATE POLICY roles_tenant_policy ON roles USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, role_id)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_tenant_policy ON user_roles;
CREATE POLICY user_roles_tenant_policy ON user_roles USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, 
    conditions JSONB, 
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, feature, action)
);
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS permissions_tenant_policy ON permissions;
CREATE POLICY permissions_tenant_policy ON permissions USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);
