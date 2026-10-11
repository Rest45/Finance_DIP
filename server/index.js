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

// 1. Тестовый маршрут
app.get('/test-db', async (req, res) => {
  try {
    await pool.query('SELECT NOW()');
    res.json({ message: 'Связь с базой работает отлично!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. РЕГИСТРАЦИЯ (с хэшированием пароля через bcrypt)
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body; 
    
    // Проверяем, существует ли пользователь
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хэшируем пароль (соль = 10 раундов)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, avatar',
      [name, email, hashedPassword]
    );
    
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка при регистрации' });
  }
});

// 3. ВХОД В СИСТЕМУ (Логин с проверкой хэша и выдачей JWT)
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Сверяем введенный пароль с хэшем в базе
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Создаем JWT токен
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, { expiresIn: '24h' });

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
      'UPDATE users SET avatar = $1 WHERE id = $2 RETURNING id, name, email, avatar',
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
    await pool.query('DELETE FROM transactions WHERE id = $1', [id]);
    res.json({ message: 'Транзакция успешно удалена' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// --- СБОРКА И РАЗДАЧА FRONTEND (PRODUCTION РЕЖИМ) ---
// Раздаем статические файлы из папки сборки клиента React (Vite: dist)
app.use(express.static(path.join(__dirname, '../client/dist')));

// Все остальные запросы перенаправляем на index.html фронтенда (для React Router) — исправлено с '*' на /.*/
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Полноценный сервер запущен на http://localhost:${PORT}`);
  
  pool.query('SELECT current_database()', (err, res) => {
    if (!err) {
      console.log('💡 Подключено к базе данных:', res.rows[0].current_database);
    }
  });
});