const express = require('express');
const cors = require('cors');
const pool = require('./db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
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

    // При регистрации все новые пользователи гарантированно получают роль 'user'
    const role = 'user';

    // Хэшируем пароль (соль = 10 раундов)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role, is_blocked) VALUES ($1, $2, $3, $4, false) RETURNING id, name, email, avatar, role, is_blocked',
      [name, email, hashedPassword, role]
    );
    
    await logAction('USER_REGISTER', email, `Зарегистрирован новый пользователь: ${name} (роль: user)`, 'SUCCESS', req.ip);
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
// 9. ФИНАНСОВЫЕ ЦЕЛИ И КОПИЛКИ (SAVINGS GOALS & PIGGY BANK)
// =========================================================

// Получить все цели пользователя
app.get('/savings-goals/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const goals = await pool.query(
      'SELECT * FROM savings_goals WHERE user_id = $1 ORDER BY deadline ASC NULLS LAST, id DESC',
      [user_id]
    );
    res.json(goals.rows);
  } catch (err) {
    console.error('Error fetching savings goals:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении финансовых целей' });
  }
});

// Создать новую цель / копилку
app.post('/savings-goals', async (req, res) => {
  try {
    const { user_id, title, target_amount, current_amount, currency, deadline, color, category_icon } = req.body;
    if (!title || !target_amount || Number(target_amount) <= 0) {
      return res.status(400).json({ error: 'Укажите название и корректную сумму цели' });
    }

    const newGoal = await pool.query(
      `INSERT INTO savings_goals (user_id, title, target_amount, current_amount, currency, deadline, color, category_icon)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        user_id,
        title,
        target_amount,
        current_amount || 0,
        currency || 'AMD',
        deadline || null,
        color || '#4f46e5',
        category_icon || 'piggy-bank'
      ]
    );

    await logAction('SAVINGS_GOAL_CREATED', `User #${user_id}`, `Создана цель: "${title}" на ${target_amount} ${currency || 'AMD'}`, 'SUCCESS', req.ip);
    res.json(newGoal.rows[0]);
  } catch (err) {
    console.error('Error creating savings goal:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при создании цели' });
  }
});

// Пополнение или списание из копилки
app.post('/savings-goals/:id/deposit', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;
    const depositAmount = Number(amount);
    if (isNaN(depositAmount) || depositAmount === 0) {
      return res.status(400).json({ error: 'Укажите корректную сумму' });
    }

    const updated = await pool.query(
      'UPDATE savings_goals SET current_amount = GREATEST(0, current_amount + $1) WHERE id = $2 RETURNING *',
      [depositAmount, id]
    );

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Цель не найдена' });
    }

    const goal = updated.rows[0];
    await logAction(
      depositAmount > 0 ? 'SAVINGS_DEPOSIT' : 'SAVINGS_WITHDRAW',
      `User #${goal.user_id}`,
      `Изменение баланса цели "${goal.title}": ${depositAmount > 0 ? '+' : ''}${depositAmount} ${goal.currency}`,
      'SUCCESS',
      req.ip
    );

    res.json(goal);
  } catch (err) {
    console.error('Error updating savings deposit:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при пополнении копилки' });
  }
});

// Удалить цель
app.delete('/savings-goals/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await pool.query('DELETE FROM savings_goals WHERE id = $1 RETURNING *', [id]);
    if (deleted.rows.length === 0) return res.status(404).json({ error: 'Цель не найдена' });

    res.json({ message: 'Цель успешно удалена', goal: deleted.rows[0] });
  } catch (err) {
    console.error('Error deleting savings goal:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при удалении цели' });
  }
});

// =========================================================
// 10. РЕГУЛЯРНЫЕ ПЛАТЕЖИ И ПОДПИСКИ (SUBSCRIPTIONS TRACKER)
// =========================================================

// Получить все подписки пользователя
app.get('/subscriptions/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const subs = await pool.query(
      'SELECT * FROM subscriptions WHERE user_id = $1 ORDER BY next_payment_date ASC, id DESC',
      [user_id]
    );
    res.json(subs.rows);
  } catch (err) {
    console.error('Error fetching subscriptions:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при получении подписок' });
  }
});

// Добавить новую подписку
app.post('/subscriptions', async (req, res) => {
  try {
    const { user_id, name, amount, currency, billing_cycle, next_payment_date, category } = req.body;
    if (!name || !amount || Number(amount) <= 0 || !next_payment_date) {
      return res.status(400).json({ error: 'Заполните все обязательные поля' });
    }

    const newSub = await pool.query(
      `INSERT INTO subscriptions (user_id, name, amount, currency, billing_cycle, next_payment_date, category, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
      [
        user_id,
        name,
        amount,
        currency || 'AMD',
        billing_cycle || 'monthly',
        next_payment_date,
        category || 'Подписки'
      ]
    );

    await logAction('SUBSCRIPTION_CREATED', `User #${user_id}`, `Добавлена подписка "${name}" (${amount} ${currency || 'AMD'})`, 'SUCCESS', req.ip);
    res.json(newSub.rows[0]);
  } catch (err) {
    console.error('Error adding subscription:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при создании подписки' });
  }
});

// Переключить активность подписки
app.put('/subscriptions/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params;
    const sub = await pool.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
    if (sub.rows.length === 0) return res.status(404).json({ error: 'Подписка не найдена' });

    const newStatus = !sub.rows[0].is_active;
    const updated = await pool.query(
      'UPDATE subscriptions SET is_active = $1 WHERE id = $2 RETURNING *',
      [newStatus, id]
    );

    res.json(updated.rows[0]);
  } catch (err) {
    console.error('Error toggling subscription:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при обновлении статуса подписки' });
  }
});

// Оплатить подписку в 1 клик (сгенерировать транзакцию расхода + перенести дату платежа)
app.post('/subscriptions/:id/pay', async (req, res) => {
  try {
    const { id } = req.params;
    const subRes = await pool.query('SELECT * FROM subscriptions WHERE id = $1', [id]);
    if (subRes.rows.length === 0) return res.status(404).json({ error: 'Подписка не найдена' });

    const sub = subRes.rows[0];

    // Находим категорию для подписок (или берем категорию 14 "Связь и интернет" / дефолтную)
    const catQuery = await pool.query("SELECT id FROM categories WHERE name ILIKE '%подписк%' OR name ILIKE '%интернет%' LIMIT 1");
    const categoryId = catQuery.rows.length > 0 ? catQuery.rows[0].id : null;

    // Создаем расход
    const transaction = await pool.query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, currency, date)
       VALUES ($1, $2, 'expense', $3, $4, $5, CURRENT_TIMESTAMP) RETURNING *`,
      [sub.user_id, categoryId, sub.amount, `Оплата сервиса: ${sub.name}`, sub.currency]
    );

    // Рассчитываем следующую дату платежа
    const currentDate = new Date(sub.next_payment_date);
    if (sub.billing_cycle === 'weekly') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else if (sub.billing_cycle === 'yearly') {
      currentDate.setFullYear(currentDate.getFullYear() + 1);
    } else {
      // monthly
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    const nextDateStr = currentDate.toISOString().split('T')[0];

    const updatedSub = await pool.query(
      'UPDATE subscriptions SET next_payment_date = $1 WHERE id = $2 RETURNING *',
      [nextDateStr, id]
    );

    await logAction('SUBSCRIPTION_PAID', `User #${sub.user_id}`, `Произведена авто-оплата подписки "${sub.name}" на сумму ${sub.amount} ${sub.currency}`, 'SUCCESS', req.ip);

    res.json({
      message: 'Подписка успешно оплачена и продлена!',
      transaction: transaction.rows[0],
      subscription: updatedSub.rows[0]
    });
  } catch (err) {
    console.error('Error paying subscription:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при оплате подписки' });
  }
});

// Удалить подписку
app.delete('/subscriptions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM subscriptions WHERE id = $1', [id]);
    res.json({ message: 'Подписка успешно удалена' });
  } catch (err) {
    console.error('Error deleting subscription:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при удалении подписки' });
  }
});

// =========================================================
// 11. КАТЕГОРИАЛЬНЫЕ БЮДЖЕТЫ (CATEGORY-SPECIFIC BUDGETS)
// =========================================================

// Получить лимиты по категориям пользователя
app.get('/category-budgets/:user_id', async (req, res) => {
  try {
    const { user_id } = req.params;
    const budgets = await pool.query(
      `SELECT cb.*, c.name AS category_name, c.type AS category_type 
       FROM category_budgets cb
       JOIN categories c ON cb.category_id = c.id
       WHERE cb.user_id = $1
       ORDER BY cb.id ASC`,
      [user_id]
    );
    res.json(budgets.rows);
  } catch (err) {
    console.error('Error fetching category budgets:', err.message);
    res.status(500).json({ error: 'Ошибка при получении бюджетов' });
  }
});

// Установить или обновить лимит категории
app.post('/category-budgets', async (req, res) => {
  try {
    const { user_id, category_id, monthly_limit, currency } = req.body;
    if (!category_id || !monthly_limit || Number(monthly_limit) <= 0) {
      return res.status(400).json({ error: 'Укажите категорию и положительный лимит' });
    }

    const upserted = await pool.query(
      `INSERT INTO category_budgets (user_id, category_id, monthly_limit, currency)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, category_id, currency)
       DO UPDATE SET monthly_limit = EXCLUDED.monthly_limit
       RETURNING *`,
      [user_id, category_id, monthly_limit, currency || 'AMD']
    );

    res.json(upserted.rows[0]);
  } catch (err) {
    console.error('Error setting category budget:', err.message);
    res.status(500).json({ error: 'Ошибка сервера при сохранении бюджета' });
  }
});

// Удалить лимит категории
app.delete('/category-budgets/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM category_budgets WHERE id = $1', [id]);
    res.json({ message: 'Лимит категории удален' });
  } catch (err) {
    console.error('Error deleting category budget:', err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// =========================================================
// 12. КУРСЫ ВАЛЮТ И ОБЩИЙ КАПИТАЛ (FX RATES & NET WORTH)
// =========================================================
app.get('/exchange-rates', async (req, res) => {
  try {
    // Надежные базовые курсы относительно армянского драма (AMD)
    // 1 USD ≈ 388 AMD, 1 EUR ≈ 422 AMD, 1 RUB ≈ 4.25 AMD
    const toAmd = {
      AMD: 1,
      USD: 388.0,
      EUR: 422.0,
      RUB: 4.25
    };

    const rates = {
      AMD: 1,
      USD: 1 / toAmd.USD,
      EUR: 1 / toAmd.EUR,
      RUB: 1 / toAmd.RUB
    };

    res.json({
      base: 'AMD',
      toAmd,
      rates,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error providing exchange rates:', err.message);
    res.status(500).json({ error: 'Ошибка получения курсов валют' });
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

// Защищаем административные API маршруты
app.use(['/admin/users', '/admin/categories', '/admin/stats', '/admin/logs'], authenticateAdmin);

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
const clientDistPath = path.join(__dirname, '../client/dist');
const indexHtmlPath = path.join(clientDistPath, 'index.html');

if (fs.existsSync(indexHtmlPath)) {
  app.use(express.static(clientDistPath));
  app.get(/.*/, (req, res) => {
    res.sendFile(indexHtmlPath);
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      service: 'FinanceHub REST API Server',
      database: 'connected',
      endpoints: [
        '/users', '/login', '/categories', '/transactions',
        '/savings-goals', '/subscriptions', '/category-budgets', '/exchange-rates'
      ],
      note: 'Frontend client/dist is not built on this web service. Access frontend through its separate URL.'
    });
  });
}

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
  
  pool.query('SELECT current_database()', async (err, res) => {
    if (!err && res.rows[0]) {
      console.log('💡 Подключено к базе данных:', res.rows[0].current_database);

      // Автоматическая проверка и обновление схемы БД (миграция при старте)
      try {
        await pool.query(`
          ALTER TABLE users 
          ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user',
          ADD COLUMN IF NOT EXISTS is_blocked BOOLEAN DEFAULT false;

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
        console.log('Структура базы данных проверена (users.role, audit_logs)');
      } catch (migrationErr) {
        console.error('Ошибка автоматической миграции структуры БД:', migrationErr.message);
      }
    }
  });
});
