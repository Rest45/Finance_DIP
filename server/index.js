const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'diploma_super_secret_key_123';

// Middleware
app.use(cors());
app.use(express.json());

// Вспомогательная функция аудита и логирования (Audit Logging)
const logAction = async (action, user_email = 'system', details = '', status = 'SUCCESS', ip = '127.0.0.1') => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (action, user_email, details, status, ip_address) VALUES ($1, $2, $3, $4, $5)',
      [action, user_email, details, status, ip]
    );
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

// 1. Тестовый маршрут
app.get('/test-db', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ message: 'Связь с базой работает отлично!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. РЕГИСТРАЦИЯ
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body; 
    
    // Проверяем, существует ли пользователь
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Роль: по умолчанию 'user', 'admin' только для первого пользователя или создателя
    const countRes = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const isFirstUser = countRes.rows[0].count === 0;
    const role = (isFirstUser || email.toLowerCase() === 'ashotrestevanyan38@gmail.com') 
      ? 'admin' 
      : 'user';

    // Хэшируем пароль (соль = 10 раундов)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role, is_blocked) VALUES ($1, $2, $3, $4, false) RETURNING id, name, email, avatar, role, is_blocked',
      [name, email, hashedPassword, role]
    );
    
    await logAction('USER_REGISTER', email, `Зарегистрирован новый пользователь: ${name} (роль: ${role})`, 'SUCCESS', req.ip);
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    await logAction('USER_REGISTER_FAILED', req.body?.email || 'unknown', err.message, 'ERROR', req.ip);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// 3. ВХОД В СИСТЕМУ
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      await logAction('LOGIN_FAILED', email, 'Попытка входа с несуществующим email', 'WARNING', req.ip);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Проверяем блокировку
    if (user.rows[0].is_blocked) {
      await logAction('LOGIN_BLOCKED', email, 'Попытка входа заблокированного аккаунта', 'DENIED', req.ip);
      return res.status(403).json({ error: 'Ваш аккаунт заблокирован администратором' });
    }

    // Сверяем введенный пароль с хэшем в базе
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      await logAction('LOGIN_WRONG_PASSWORD', email, 'Неверный пароль', 'WARNING', req.ip);
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, JWT_SECRET, { expiresIn: '24h' });

    await logAction('USER_LOGIN', email, 'Успешный вход в систему', 'SUCCESS', req.ip);

    // Отправляем токен и данные пользователя (без пароля)
    const { password: _, ...userData } = user.rows[0];
    res.json({ message: 'Успешный вход!', token, user: userData });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 4. Обновление аватара
app.put('/users/:id/avatar', async (req, res) => {
  try {
    const { id } = req.params;
    const { avatar } = req.body;
    const updatedUser = await pool.query(
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, email, avatar, role, is_blocked',
      [avatar, id]
    );
    res.json(updatedUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при обновлении аватара' });
  }
});

// 5. Получение категорий
app.get('/categories', async (req, res) => {
  try {
    const categories = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json(categories.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 6. Добавление транзакции
app.post('/transactions', async (req, res) => {
  try {
    const { user_id, category_id, type, amount, description, currency, date } = req.body;
    const newTransaction = await pool.query(
      'INSERT INTO transactions (user_id, category_id, type, amount, description, currency, date) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, category_id || null, type, amount, description, currency || 'AMD', date || new Date()]
    );

    const user = await pool.query('SELECT email FROM users WHERE id = $1', [user_id]);
    const userEmail = user.rows[0]?.email || `User #${user_id}`;
    await logAction('TRANSACTION_CREATED', userEmail, `Создана операция: ${type.toUpperCase()} ${amount} ${currency || 'AMD'} (${description || 'без описания'})`, 'SUCCESS', req.ip);

    res.json(newTransaction.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 7. Получение транзакций пользователя
app.get('/transactions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const transactions = await pool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY id DESC',
      [user_id]
    );
    res.json(transactions.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// 8. Удаление транзакции
app.delete('/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await pool.query('SELECT user_id, amount, currency, type FROM transactions WHERE id = $1', [id]);
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);

    if (existing.rows.length > 0) {
      const item = existing.rows[0];
      await logAction('TRANSACTION_DELETED', `User #${item.user_id}`, `Удалена операция: ID ${id} (${item.type} ${item.amount} ${item.currency})`, 'INFO', req.ip);
    }

    res.json({ message: 'Транзакция успешно удалена' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// =========================================================
// ADMIN AUTHENTICATION & ACCESS CONTROL MIDDLEWARE
// =========================================================
const authenticateAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    const headerUserId = req.headers['x-user-id'];

    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (tokenErr) {
        // Fallback to headerUserId if token verification fails
      }
    }

    if (!userId && headerUserId) {
      userId = headerUserId;
    }

    if (!userId) {
      return res.status(401).json({ error: 'Доступ ограничен: требуется авторизация' });
    }

    // Всегда проверяем актуальную роль и блокировку в базе данных
    const userRes = await pool.query('SELECT id, name, email, role, is_blocked FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(401).json({ error: 'Пользователь не найден' });
    }

    const user = userRes.rows[0];
    if (user.is_blocked) {
      return res.status(403).json({ error: 'Аккаунт заблокирован' });
    }

    if (user.role !== 'admin') {
      await logAction('UNAUTHORIZED_ADMIN_ACCESS', user.email, `Попытка доступа без прав администратора к ${req.originalUrl}`, 'WARNING', req.ip);
      return res.status(403).json({ error: 'Доступ запрещен: требуются права администратора' });
    }

    req.adminUser = user;
    next();
  } catch (err) {
    console.error('Admin authentication error:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при проверке прав доступа' });
  }
};

// Защищаем все административные маршруты
app.use('/admin', authenticateAdmin);

// =========================================================
// ADMIN PANEL API (УПРАВЛЕНИЕ, СТАТИСТИКА, МОНИТОРИНГ)
// =========================================================

// A. Управление пользователями: список всех пользователей с аналитикой их транзакций
app.get('/admin/users', async (req, res) => {
  try {
    const users = await pool.query(`
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.avatar, 
        u.role, 
        u.is_blocked, 
        u.created_at,
        COUNT(t.id)::int AS transaction_count,
        COALESCE(SUM(CASE WHEN t.type = 'income' THEN t.amount ELSE 0 END), 0)::numeric AS total_income,
        COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0)::numeric AS total_expense
      FROM users u
      LEFT JOIN transactions t ON u.id = t.user_id
      GROUP BY u.id
      ORDER BY u.id ASC
    `);
    res.json(users.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении пользователей' });
  }
});

// Блокировка / разблокировка пользователя
app.put('/admin/users/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });
    
    const newStatus = !user.rows[0].is_blocked;
    const updated = await pool.query(
      'UPDATE users SET is_blocked = $1 WHERE id = $2 RETURNING id, name, email, avatar, role, is_blocked',
      [newStatus, id]
    );
    
    await logAction(
      newStatus ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      user.rows[0].email,
      `Статус аккаунта ${user.rows[0].email} изменен на: ${newStatus ? 'ЗАБЛОКИРОВАН' : 'АКТИВЕН'}`,
      'WARNING',
      req.ip
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при изменении статуса блокировки' });
  }
});

// Смена роли пользователя (admin / user)
app.put('/admin/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Некорректная роль' });
    }

    const updated = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, avatar, role, is_blocked',
      [role, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ error: 'Пользователь не найден' });

    await logAction('ROLE_CHANGED', updated.rows[0].email, `Пользователю назначена роль: ${role.toUpperCase()}`, 'INFO', req.ip);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при смене роли' });
  }
});

// Удаление пользователя
app.delete('/admin/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query('SELECT email FROM users WHERE id = $1', [id]);
    const email = user.rows.length > 0 ? user.rows[0].email : `ID #${id}`;
    
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    await logAction('USER_DELETED', email, `Пользователь ${email} безвозвратно удален из системы со всеми транзакциями`, 'DANGER', req.ip);
    
    res.json({ message: 'Пользователь успешно удален' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при удалении пользователя' });
  }
});

// B. Глобальное управление категориями
app.post('/admin/categories', async (req, res) => {
  try {
    const { name, type } = req.body;
    if (!name || !type) return res.status(400).json({ error: 'Имя и тип категории обязательны' });
    
    const newCat = await pool.query(
      'INSERT INTO categories (name, type) VALUES ($1, $2) RETURNING *',
      [name, type]
    );
    await logAction('CATEGORY_ADDED', 'admin', `Добавлена глобальная категория: "${name}" (${type})`, 'SUCCESS', req.ip);
    res.json(newCat.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при добавлении категории' });
  }
});

app.put('/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;
    const updated = await pool.query(
      'UPDATE categories SET name = $1, type = $2 WHERE id = $3 RETURNING *',
      [name, type, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ error: 'Категория не найдена' });

    await logAction('CATEGORY_UPDATED', 'admin', `Обновлена категория ID #${id}: "${name}" (${type})`, 'INFO', req.ip);
    res.json(updated.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при обновлении категории' });
  }
});

app.delete('/admin/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await pool.query('SELECT name FROM categories WHERE id = $1', [id]);
    const catName = cat.rows.length > 0 ? cat.rows[0].name : `ID #${id}`;

    await pool.query('DELETE FROM categories WHERE id = $1', [id]);
    await logAction('CATEGORY_DELETED', 'admin', `Удалена глобальная категория: "${catName}"`, 'WARNING', req.ip);
    res.json({ message: 'Категория успешно удалена' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при удалении категории' });
  }
});

// C. Системная статистика и аналитика (Platform Analytics)
app.get('/admin/stats', async (req, res) => {
  try {
    const [usersCount, transCount, currencyStats, typeStats, topCats, recentRegs] = await Promise.all([
      pool.query(`
        SELECT 
          COUNT(*)::int AS total_users,
          COUNT(CASE WHEN is_blocked = true THEN 1 END)::int AS blocked_users,
          COUNT(CASE WHEN role = 'admin' THEN 1 END)::int AS admin_users
        FROM users
      `),
      pool.query(`
        SELECT 
          COUNT(*)::int AS total_transactions,
          COUNT(DISTINCT user_id)::int AS active_transacting_users
        FROM transactions
      `),
      pool.query(`
        SELECT 
          currency,
          COUNT(*)::int AS count,
          COALESCE(SUM(amount), 0)::numeric AS total_turnover,
          COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0)::numeric AS income_total,
          COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0)::numeric AS expense_total
        FROM transactions
        GROUP BY currency
        ORDER BY count DESC
      `),
      pool.query(`
        SELECT 
          type, 
          COUNT(*)::int AS count, 
          COALESCE(SUM(amount), 0)::numeric AS total
        FROM transactions
        GROUP BY type
      `),
      pool.query(`
        SELECT 
          c.id, 
          c.name, 
          c.type, 
          COUNT(t.id)::int AS count, 
          COALESCE(SUM(t.amount), 0)::numeric AS total
        FROM categories c
        LEFT JOIN transactions t ON c.id = t.category_id
        GROUP BY c.id
        ORDER BY count DESC
        LIMIT 8
      `),
      pool.query(`
        SELECT 
          TO_CHAR(created_at, 'YYYY-MM-DD') AS reg_date,
          COUNT(*)::int AS count
        FROM users
        GROUP BY TO_CHAR(created_at, 'YYYY-MM-DD')
        ORDER BY reg_date DESC
        LIMIT 7
      `)
    ]);

    res.json({
      users: usersCount.rows[0],
      transactions: transCount.rows[0],
      currencies: currencyStats.rows,
      types: typeStats.rows,
      topCategories: topCats.rows,
      recentRegistrations: recentRegs.rows.reverse()
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при расчете аналитики' });
  }
});

// D. Мониторинг и логи безопасности (Security & Activity Logs)
app.get('/admin/logs', async (req, res) => {
  try {
    const logs = await pool.query('SELECT * FROM audit_logs ORDER BY id DESC LIMIT 100');
    res.json(logs.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении логов' });
  }
});

app.delete('/admin/logs', async (req, res) => {
  try {
    await pool.query('DELETE FROM audit_logs');
    await logAction('LOGS_CLEARED', 'admin', 'Журнал аудита очищен администратором', 'INFO', req.ip);
    res.json({ message: 'Журнал логов успешно очищен' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера при очистке логов' });
  }
});

// --- СБОРКА И РАЗДАЧА FRONTEND (PRODUCTION РЕЖИМ) ---
app.use(express.static(path.join(__dirname, '../client/dist')));

app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  
  pool.query('SELECT current_database()', (err, res) => {
    if (!err && res.rows[0]) {
      console.log('Подключено к базе данных:', res.rows[0].current_database);
    }
  });
});