const pool = require('./db');
const bcrypt = require('bcrypt');

async function migrate() {
  try {
    console.log('Running database migrations...');

    // 1. Add role and is_blocked columns to users if they do not exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
    `);
    console.log('Users table columns (role, is_blocked) verified.');

    // 2. Set default role 'user' for any users with NULL role
    await pool.query(`
      UPDATE users SET role = 'user' WHERE role IS NULL;
    `);

    // 3. Add CHECK constraint on role to enforce ('user', 'admin') if not present
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
        ) THEN
          ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('user', 'admin'));
        END IF;
      END $$;
    `);
    console.log('Role constraint (user, admin) verified.');

    // 4. Create audit_logs table for system monitoring & activity tracking
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        action VARCHAR(100) NOT NULL,
        user_email VARCHAR(255),
        details TEXT,
        ip_address VARCHAR(100),
        status VARCHAR(20) DEFAULT 'SUCCESS',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE audit_logs 
      ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
      ADD COLUMN IF NOT EXISTS action VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
      ADD COLUMN IF NOT EXISTS details TEXT,
      ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100),
      ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'SUCCESS';
    `);
    console.log('✓ audit_logs table created & updated with user_email');

    // 5. Seed / Update 1 designated Admin user
    const adminEmail = 'admin@finance.app';
    const adminPasswordPlain = 'admin12345';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPasswordPlain, salt);

    const existingAdmin = await pool.query('SELECT id, email, role FROM users WHERE email = $1', [adminEmail]);

    if (existingAdmin.rows.length === 0) {
      await pool.query(
        `INSERT INTO users (name, email, password, role, is_blocked, avatar)
         VALUES ($1, $2, $3, 'admin', false, 'https://cdn-icons-png.flaticon.com/512/847/847969.png')`,
        ['Administrator', adminEmail, hashedPassword]
      );
      console.log(`Admin user created: ${adminEmail}`);
    } else {
      await pool.query(
        `UPDATE users 
         SET role = 'admin', password = $1, is_blocked = false 
         WHERE email = $2`,
        [hashedPassword, adminEmail]
      );
      console.log(`Admin user updated with admin role: ${adminEmail}`);
    }

    // 6. Create tables for Savings Goals, Subscriptions, and Category Budgets
    await pool.query(`
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

      CREATE TABLE IF NOT EXISTS category_budgets (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
        monthly_limit NUMERIC(14, 2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'AMD',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_user_cat_currency UNIQUE (user_id, category_id, currency)
      );
    `);
    console.log('✓ Tables savings_goals, subscriptions, and category_budgets verified.');

    // 7. Record audit log
    await pool.query(`
      INSERT INTO audit_logs (action, user_email, details, status)
      VALUES ('MIGRATION_V2', $1, 'Savings goals, subscriptions, and category budgets migrated', 'SUCCESS');
    `, [adminEmail]);

    console.log('\n==========================================');
    console.log('Migrations completed successfully!');
    console.log('Admin Credentials:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPasswordPlain}`);
    console.log(`   Role:     admin`);
    console.log('==========================================\n');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
