import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const translations = {
  ru: {
    title: 'Регистрация аккаунта',
    subtitle: 'Создайте профиль и начните вести учет финансов',
    name: 'Ваше имя',
    email: 'Электронная почта',
    password: 'Пароль',
    registerBtn: 'Создать аккаунт',
    haveAccount: 'Уже есть аккаунт?',
    loginLink: 'Войти'
  },
  en: {
    title: 'Create an Account',
    subtitle: 'Sign up to start tracking your income and expenses',
    name: 'Full Name',
    email: 'Email address',
    password: 'Password',
    registerBtn: 'Create Account',
    haveAccount: 'Already have an account?',
    loginLink: 'Sign In'
  },
  hy: {
    title: 'Գրանցում համակարգում',
    subtitle: 'Ստեղծեք հաշիվ և կառավարեք Ձեր եկամուտներն ու ծախսերը',
    name: 'Ամբողջական անուն',
    email: 'Էլ. հասցե',
    password: 'Գաղտնաբառ',
    registerBtn: 'Գրանցվել',
    haveAccount: 'Արդե՞ն ունեք հաշիվ:',
    loginLink: 'Մուտք գործել'
  }
};

function Register({ lang }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const t = translations[lang] || translations.hy;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      await axios.post(`${API_URL}/users`, { name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 68px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(ellipse at top, var(--bg-card-subtle) 0%, var(--bg-main) 100%)'
    }}>
      <div className="fintech-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 36px',
        borderRadius: '24px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)'
      }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 18px rgba(5, 150, 105, 0.35)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <line x1="20" y1="8" x2="20" y2="14" />
              <line x1="23" y1="11" x2="17" y2="11" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
            {t.title}
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Register Form */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {t.name}
            </label>
            <input 
              type="text" 
              placeholder="John Doe"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="fintech-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {t.email}
            </label>
            <input 
              type="email" 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              className="fintech-input"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {t.password}
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              className="fintech-input"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="fintech-btn-primary"
            style={{ width: '100%', height: '48px', marginTop: '6px', fontSize: '0.95rem' }}
          >
            {loading ? '...' : t.registerBtn}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: 'var(--expense-bg)',
            border: '1px solid var(--expense-border)',
            borderRadius: '10px',
            color: 'var(--expense)',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          {t.haveAccount}{' '}
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            {t.loginLink}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;