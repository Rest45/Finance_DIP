-- ============================================================
-- Migration: 001_roles_and_admin_user.sql
-- Description: Add role column (user/admin) to users table,
--              add role validation constraint, and seed default admin user.
-- ============================================================

-- 1. Add role & is_blocked columns if they do not exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

-- 2. Update existing users with NULL role to 'user'
UPDATE users SET role = 'user' WHERE role IS NULL;

-- 3. Enforce valid roles: 'user' or 'admin'
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
    END IF;
END $$;

-- 4. Create Audit Logs table if it does not exist
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(100),
    status VARCHAR(20) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed / Ensure default Admin User
-- Credentials:
--   Email:    admin@finance.app
--   Password: admin12345
--   Role:     admin
INSERT INTO users (name, email, password, role, is_blocked, avatar)
VALUES (
    'Administrator',
    'admin@finance.app',
    -- bcrypt hash for 'admin12345'
    '$2b$10$wN1dYcQGq6wV4iR5Lq/f5e3T.c9vH1M4K2J0G7bE6Q2V8u7h5e2d6',
    'admin',
    false,
    'https://cdn-icons-png.flaticon.com/512/847/847969.png'
)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin',
    is_blocked = false;

-- 6. Log migration execution in audit_logs
INSERT INTO audit_logs (action, user_email, details, status)
VALUES ('MIGRATION_001_APPLIED', 'admin@finance.app', 'Migration 001: roles and initial admin user configured', 'SUCCESS');
