-- Create extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==========================================
-- 1. TENANTS TABLE
-- ==========================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. USERS TABLE
-- ==========================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, email)
);

-- Enable Row Level Security (RLS) on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Creating the RLS Policy for Users
-- The Go application will set the session variable `app.current_tenant` 
-- before executing queries for a specific tenant context.
-- The TRUE flag in current_setting allows it to return NULL if not set, instead of throwing an error,
-- but we cast it to UUID. If it's not set, the policy will evaluate to false, protecting data.
CREATE POLICY tenant_isolation_policy ON users
    USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- ==========================================
-- 3. RBAC / ABAC TABLES
-- ==========================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY roles_tenant_policy ON roles USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    PRIMARY KEY(user_id, role_id)
);
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_roles_tenant_policy ON user_roles USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    feature VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL, -- create, read, update, delete, execute
    conditions JSONB, -- For ABAC: e.g., {"department": "HR"}
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role_id, feature, action)
);
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_tenant_policy ON permissions USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- ==========================================
-- 4. DYNAMIC FORMS & EAV TABLES
-- ==========================================
CREATE TABLE form_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL, -- e.g., 'employee', 'task', 'project'
    schema JSONB NOT NULL, -- JSON Schema defining the form fields
    ui_schema JSONB, -- UI specific rendering config
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, entity_type)
);
ALTER TABLE form_definitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY form_definitions_tenant_policy ON form_definitions USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- ==========================================
-- 5. HRMS TABLES
-- ==========================================
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    department_id UUID, -- Setup a departments table similarly
    designation VARCHAR(100),
    manager_id UUID REFERENCES employees(id),
    dynamic_data JSONB, -- Bound to form_definitions schema validation
    status VARCHAR(50) DEFAULT 'active',
    joining_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY employees_tenant_policy ON employees USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- punch_in, punch_out
    log_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    photo_url VARCHAR(255)
);
ALTER TABLE attendance_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY attendance_logs_tenant_policy ON attendance_logs USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE leave_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    allowed_days INT NOT NULL DEFAULT 0,
    dynamic_rules_id UUID, -- Links to generic Rule sets for evaluator
    created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY leave_policies_tenant_policy ON leave_policies USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_policy_id UUID NOT NULL REFERENCES leave_policies(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    approved_by_id UUID REFERENCES employees(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY leave_requests_tenant_policy ON leave_requests USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- ==========================================
-- 6. PROJECT MANAGEMENT TABLES
-- ==========================================
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by_id UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY projects_tenant_policy ON projects USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- Adjacency list for infinite subtasks
    title VARCHAR(255) NOT NULL,
    description TEXT,
    dynamic_data JSONB, -- For custom task form definitions
    stage VARCHAR(50) DEFAULT 'todo', -- Kanban Column
    assignee_id UUID REFERENCES employees(id),
    priority INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY tasks_tenant_policy ON tasks USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- Index for querying subtasks and Kanban stages efficiently
CREATE INDEX idx_tasks_project_id_stage ON tasks(project_id, stage);
CREATE INDEX idx_tasks_parent_id ON tasks(parent_id);

-- ==========================================
-- 7. SKILL ASSESSMENT TABLES
-- ==========================================
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- quiz, coding, 360_feedback, survey
    title VARCHAR(255) NOT NULL,
    description TEXT,
    config JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY assessments_tenant_policy ON assessments USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    answer TEXT,
    ai_params JSONB
);
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY questions_tenant_policy ON questions USING (tenant_id = NULLIF(current_setting('app.current_tenant', true), '')::UUID);

-- ==========================================
-- INITIAL DATA (Optional)
-- ==========================================
-- INSERT INTO tenants (id, name, domain) VALUES ('00000000-0000-0000-0000-000000000001', 'Default Corp', 'defaultcorp.com');
