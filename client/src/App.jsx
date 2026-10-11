import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const navTranslations = {
  ru: { register: 'Регистрация', login: 'Вход', finances: 'Мои финансы', admin: 'Админ-панель', appName: 'FinanceHub' },
  en: { register: 'Register', login: 'Login', finances: 'My Finances', admin: 'Admin Panel', appName: 'FinanceHub' },
  hy: { register: 'Գրանցում', login: 'Մուտք', finances: 'Ֆինանսներ', admin: 'Ադմին պանել', appName: 'FinanceHub' }
};

function NavigationBar({ lang, onLangChange, currentUser }) {
  const t = navTranslations[lang] || navTranslations.hy;
  const location = useLocation();

  const isFinancesActive = location.pathname === '/dashboard' || location.pathname === '/history' || location.pathname === '/transactions' || location.pathname === '/analytics';
  const isAdminActive = location.pathname === '/admin';
  const isActive = (path) => location.pathname === path;
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(15, 23, 42, 0.92)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      padding: '0 28px',
      height: '68px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
        <Link to={currentUser ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em' }}>
              Finance<span style={{ color: '#818cf8' }}>Hub</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {currentUser ? (
            <>
              <Link 
                to="/dashboard" 
                style={{
                  color: isFinancesActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isFinancesActive ? 'rgba(255, 255, 255, 0.12)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.15s ease'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
                {t.finances}
              </Link>
              {isAdmin && (
                <Link 
                  to="/admin" 
                  style={{
                    color: isAdminActive ? '#ffffff' : '#38bdf8',
                    backgroundColor: isAdminActive ? 'rgba(56, 189, 248, 0.2)' : 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  {t.admin}
                </Link>
              )}
            </>
          ) : (
            <>
              <Link 
                to="/" 
                style={{
                  color: isActive('/') ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive('/') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.login}
              </Link>
              <Link 
                to="/register" 
                style={{
                  color: isActive('/register') ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive('/register') ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: User info & Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={currentUser.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'} 
              alt="Profile" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #818cf8' }}
            />
            <span style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 500 }}>
              {currentUser.email}
            </span>
          </div>
        )}

        {/* Language selector pill */}
        <select 
          value={lang} 
          onChange={(e) => onLangChange(e.target.value)} 
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.85rem',
            fontWeight: 500,
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        >
          <option value="hy">Հայերեն</option>
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>
    </nav>
  );
}

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

  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <Router>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <NavigationBar 
          lang={lang} 
          onLangChange={handleLangChange} 
          currentUser={currentUser} 
        />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Login lang={lang} />} />
            <Route path="/register" element={<Register lang={lang} />} />
            <Route path="/dashboard" element={<Dashboard lang={lang} />} />
            <Route path="/history" element={<Dashboard lang={lang} />} />
            <Route path="/transactions" element={<Dashboard lang={lang} />} />
            <Route path="/analytics" element={<Dashboard lang={lang} />} />
            {/* Админ-панель доступна по прямому URL только для роли admin */}
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
        </main>
      </div>
    </Router>
  );
}

export default App;