const pool = require('./db');

async function migrate() {
  try {
    console.log('Running migrations...');

    // 1. Add role and is_blocked columns to users if they do not exist
    await pool.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
      ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;
    `);
    console.log('✓ Users table updated with role & is_blocked');

    // 2. Create audit_logs table for system monitoring & activity tracking
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
    `);
    console.log('✓ audit_logs table created');

    // 3. Make sure ashotrestevanyan38@gmail.com or first user has role = 'admin'
    await pool.query(`
      UPDATE users SET role = 'admin' 
      WHERE email = 'ashotrestevanyan38@gmail.com';
    `);

    // Insert an initial system log
    await pool.query(`
      INSERT INTO audit_logs (action, details, status)
      VALUES ('SYSTEM_INIT', 'Admin & Audit Logging system initialized successfully', 'SUCCESS');
    `);

    console.log('Migrations completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await pool.end();
  }
}

migrate();
