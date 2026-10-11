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
