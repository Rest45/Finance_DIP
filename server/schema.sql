-- ===================================================
-- Database Schema for Finance DIP Application
-- ===================================================

-- Create Database (if needed)
-- CREATE DATABASE finance_db;
-- \c finance_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar TEXT DEFAULT 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense'))
);

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'AMD',
    description TEXT,
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Audit & Activity Logs Table (Admin Monitoring)
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_email VARCHAR(255),
    details TEXT,
    ip_address VARCHAR(100),
    status VARCHAR(20) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Savings Goals & Piggy Bank Table
CREATE TABLE IF NOT EXISTS savings_goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    target_amount NUMERIC(14, 2) NOT NULL,
    current_amount NUMERIC(14, 2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'AMD',
    deadline DATE,
    color VARCHAR(30) DEFAULT '#4f46e5',
    category_icon VARCHAR(50) DEFAULT 'piggy-bank',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Subscriptions & Recurring Payments Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'AMD',
    billing_cycle VARCHAR(20) DEFAULT 'monthly',
    next_payment_date DATE NOT NULL,
    category VARCHAR(100) DEFAULT 'Подписки',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Category Budgets & Spending Limits Table
CREATE TABLE IF NOT EXISTS category_budgets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    monthly_limit NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'AMD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_cat_currency UNIQUE (user_id, category_id, currency)
);

-- ===================================================
-- Initial Category Seed Data
-- ===================================================
INSERT INTO categories (id, name, type) VALUES
    (1, 'Зарплата', 'income'),
    (2, 'Фриланс', 'income'),
    (3, 'Инвестиции', 'income'),
    (4, 'Подарки', 'income'),
    (5, 'Продажа вещей', 'income'),
    (6, 'Продукты и супермаркеты', 'expense'),
    (7, 'Кафе, рестораны и доставка', 'expense'),
    (8, 'Транспорт и такси', 'expense'),
    (9, 'Жилье и ЖКХ', 'expense'),
    (10, 'Развлечения и досуг', 'expense'),
    (11, 'Здоровье и аптеки', 'expense'),
    (12, 'Одежда и обувь', 'expense'),
    (13, 'Образование и курсы', 'expense'),
    (14, 'Связь, интернет и подписки', 'expense'),
    (15, 'Путешествия и отдых', 'expense'),
    (16, 'Прочие расходы', 'expense')
ON CONFLICT (id) DO NOTHING;

-- Synchronize sequence after manual ID inserts
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));

-- ===================================================
-- Initial Admin User (admin@finance.app / admin12345)
-- ===================================================
INSERT INTO users (name, email, password, role, is_blocked)
VALUES (
    'Administrator',
    'admin@finance.app',
    '$2b$10$wN1dYcQGq6wV4iR5Lq/f5e3T.c9vH1M4K2J0G7bE6Q2V8u7h5e2d6',
    'admin',
    false
)
ON CONFLICT (email) DO UPDATE SET role = 'admin';
