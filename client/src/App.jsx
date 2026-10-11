import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const navTranslations = {
  ru: { register: 'Регистрация', login: 'Вход', finances: 'Мои финансы', admin: 'Админ-панель' },
  en: { register: 'Register', login: 'Login', finances: 'My Finances', admin: 'Admin Panel' },
  hy: { register: 'Գրանցում', login: 'Մուտք', finances: 'Իմ ֆինանսները', admin: 'Ադմին պանել' }
};

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'hy');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const handleAuthChange = () => {
      try {
        setCurrentUser(JSON.parse(localStorage.getItem('user')) || null);
      } catch {
        setCurrentUser(null);
      }
    };

    window.addEventListener('authChange', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);
    return () => {
      window.removeEventListener('authChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = navTranslations[lang] || navTranslations.hy;
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <Router>
      <div>
        {/* Верхняя панель со ссылками меню и селектором языка */}
        <nav style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 30px',
          backgroundColor: '#1e293b',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {!currentUser && (
              <>
                <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>{t.register}</Link>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>{t.login}</Link>
              </>
            )}
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>{t.finances}</Link>
            
            {/* Панель администратора видна ТОЛЬКО для роли admin */}
            {isAdmin && (
              <Link 
                to="/admin" 
                style={{ 
                  color: '#38bdf8', 
                  textDecoration: 'none', 
                  fontWeight: 'bold',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  background: 'rgba(56, 189, 248, 0.1)',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                {t.admin}
              </Link>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            {currentUser && (
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                {currentUser.email} {isAdmin ? '(Admin)' : '(User)'}
              </span>
            )}
            <select 
              value={lang} 
              onChange={(e) => handleLangChange(e.target.value)} 
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#334155',
                color: '#fff',
                border: '1px solid #475569'
              }}
            >
              <option value="hy">Հայերեն</option>
              <option value="ru">Русский</option>
              <option value="en">English</option>
            </select>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Login lang={lang} />} />
          <Route path="/register" element={<Register lang={lang} />} />
          <Route path="/dashboard" element={<Dashboard lang={lang} />} />
          {/* Маршрут админ-панели доступен ТОЛЬКО администраторам */}
          <Route 
            path="/admin" 
            element={
              isAdmin ? (
                <Admin lang={lang} />
              ) : (
                <Navigate to={currentUser ? "/dashboard" : "/"} replace />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;