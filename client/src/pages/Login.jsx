import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../config';

const translations = {
  ru: {
    title: 'Вход в аккаунт',
    subtitle: 'Управляйте своими финансами и транзакциями',
    email: 'Электронная почта',
    password: 'Пароль',
    loginBtn: 'Войти в систему',
    noAccount: 'Еще нет аккаунта?',
    registerLink: 'Зарегистрироваться'
  },
  en: {
    title: 'Welcome Back',
    subtitle: 'Manage your finances and track transactions',
    email: 'Email address',
    password: 'Password',
    loginBtn: 'Sign In',
    noAccount: "Don't have an account?",
    registerLink: 'Create account'
  },
  hy: {
    title: 'Մուտք համակարգ',
    subtitle: 'Կառավարեք Ձեր ֆինանսները և գործարքները',
    email: 'Էլ. հասցե',
    password: 'Գաղտնաբառ',
    loginBtn: 'Մուտք գործել',
    noAccount: 'Դեռ չունե՞ք հաշիվ:',
    registerLink: 'Ստեղծել հաշիվ'
  }
};

function Login({ lang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const t = translations[lang] || translations.hy;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const response = await axios.post(`${API_URL}/login`, { email, password });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      window.dispatchEvent(new Event('authChange'));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
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
      background: 'radial-gradient(ellipse at top, #f1f5f9 0%, #f8fafc 100%)'
    }}>
      <div className="fintech-card" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '40px 36px',
        borderRadius: '24px',
        backgroundColor: '#ffffff'
      }}>
        {/* Card Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 18px rgba(79, 70, 229, 0.35)'
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>
            {t.title}
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
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
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
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
            {loading ? '...' : t.loginBtn}
          </button>
        </form>

        {error && (
          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecdd3',
            borderRadius: '10px',
            color: '#dc2626',
            fontSize: '0.85rem',
            textAlign: 'center',
            fontWeight: 600
          }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '28px', textAlign: 'center', fontSize: '0.9rem', color: '#64748b' }}>
          {t.noAccount}{' '}
          <Link to="/register" style={{ color: '#4f46e5', fontWeight: 700, textDecoration: 'none' }}>
            {t.registerLink}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;