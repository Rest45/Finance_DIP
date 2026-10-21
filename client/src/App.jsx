import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

const navTranslations = {
  ru: {
    register: 'Регистрация',
    login: 'Вход',
    finances: 'Мои финансы',
    admin: 'Админ-панель',
    goals: 'Копилки',
    subscriptions: 'Подписки',
    analytics: 'Аналитика',
    appName: 'FinanceHub',
    themeDark: 'Тёмная',
    themeLight: 'Светлая'
  },
  en: {
    register: 'Register',
    login: 'Login',
    finances: 'My Finances',
    admin: 'Admin Panel',
    goals: 'Savings',
    subscriptions: 'Subscriptions',
    analytics: 'Analytics',
    appName: 'FinanceHub',
    themeDark: 'Dark',
    themeLight: 'Light'
  },
  hy: {
    register: 'Գրանցում',
    login: 'Մուտք',
    finances: 'Ֆինանսներ',
    admin: 'Ադմին պանել',
    goals: 'Խնայողություններ',
    subscriptions: 'Բաժանորդագրություններ',
    analytics: 'Անալիտիկա',
    appName: 'FinanceHub',
    themeDark: 'Մութ',
    themeLight: 'Լուսավոր'
  }
};

function NavigationBar({ lang, onLangChange, currentUser, theme, onToggleTheme }) {
  const t = navTranslations[lang] || navTranslations.hy;
  const location = useLocation();

  const isFinancesActive = ['/dashboard', '/history', '/transactions', '/analytics', '/goals', '/subscriptions', '/budgets'].includes(location.pathname);
  const isAdminActive = location.pathname === '/admin';
  const isActive = (path) => location.pathname === path;
  const isAdmin = currentUser && currentUser.role === 'admin';

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(16px)',
      backgroundColor: 'var(--nav-bg)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      height: '66px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: 'var(--shadow-sm)'
    }}>
      {/* Brand Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to={currentUser ? "/dashboard" : "/"} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.4)'
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <line x1="2" y1="10" x2="22" y2="10" />
            </svg>
          </div>
          <div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
              Finance<span style={{ color: '#818cf8' }}>Hub</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links (Desktop) */}
        <div className="desktop-only" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {currentUser ? (
            <>
              <Link 
                to="/dashboard" 
                style={{
                  color: isFinancesActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isFinancesActive ? 'var(--primary)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
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
                    backgroundColor: isAdminActive ? 'rgba(56, 189, 248, 0.25)' : 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.88rem',
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
                  color: isActive('/') ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive('/') ? 'var(--primary)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.login}
              </Link>
              <Link 
                to="/register" 
                style={{
                  color: isActive('/register') ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive('/register') ? 'var(--primary)' : 'transparent',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.88rem',
                  transition: 'all 0.15s ease'
                }}
              >
                {t.register}
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Right Controls: Theme Toggle + User Info + Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Dark / Light Mode Toggle Button */}
        <button
          onClick={onToggleTheme}
          title={theme === 'dark' ? t.themeLight : t.themeDark}
          style={{
            background: 'var(--bg-card-subtle)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
            width: '36px',
            height: '36px',
            borderRadius: '9px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          {theme === 'dark' ? (
            /* Sun Icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            /* Moon Icon */
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        {currentUser && (
          <div className="desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img 
              src={currentUser.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'} 
              alt="Profile" 
              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #818cf8' }}
            />
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
              {currentUser.email?.split('@')[0]}
            </span>
          </div>
        )}

        {/* Language selector pill */}
        <select 
          value={lang} 
          onChange={(e) => onLangChange(e.target.value)} 
          style={{
            padding: '7px 10px',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: 'var(--bg-card-subtle)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            fontWeight: 600,
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        >
          <option value="hy">ՀԱՅ</option>
          <option value="ru">РУС</option>
          <option value="en">ENG</option>
        </select>
      </div>
    </nav>
  );
}

// Mobile Bottom Navigation Bar (для смартфонов)
function MobileBottomBar({ currentUser, lang }) {
  const location = useLocation();
  const navigate = useNavigate();
  const t = navTranslations[lang] || navTranslations.hy;

  if (!currentUser) return null;

  const currentPath = location.pathname;
  const isAdmin = currentUser.role === 'admin';

  return (
    <nav className="mobile-bottom-bar">
      <div 
        className={`mobile-nav-item ${currentPath === '/dashboard' || currentPath === '/history' ? 'active' : ''}`}
        onClick={() => navigate('/dashboard')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
        <span>{t.finances}</span>
      </div>

      <div 
        className={`mobile-nav-item ${currentPath === '/analytics' ? 'active' : ''}`}
        onClick={() => navigate('/analytics')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
        <span>{t.analytics}</span>
      </div>

      <div 
        className={`mobile-nav-item ${currentPath === '/goals' ? 'active' : ''}`}
        onClick={() => navigate('/goals')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
        </svg>
        <span>{t.goals}</span>
      </div>

      <div 
        className={`mobile-nav-item ${currentPath === '/subscriptions' ? 'active' : ''}`}
        onClick={() => navigate('/subscriptions')}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
        <span>{t.subscriptions}</span>
      </div>

      {isAdmin && (
        <div 
          className={`mobile-nav-item ${currentPath === '/admin' ? 'active' : ''}`}
          onClick={() => navigate('/admin')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Admin</span>
        </div>
      )}
    </nav>
  );
}

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'hy');
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });

  // Apply theme attribute to root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

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
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Login lang={lang} />} />
            <Route path="/register" element={<Register lang={lang} />} />
            <Route path="/dashboard" element={<Dashboard lang={lang} />} />
            <Route path="/history" element={<Dashboard lang={lang} />} />
            <Route path="/transactions" element={<Dashboard lang={lang} />} />
            <Route path="/analytics" element={<Dashboard lang={lang} />} />
            <Route path="/goals" element={<Dashboard lang={lang} />} />
            <Route path="/subscriptions" element={<Dashboard lang={lang} />} />
            <Route path="/budgets" element={<Dashboard lang={lang} />} />
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

        <MobileBottomBar currentUser={currentUser} lang={lang} />
      </div>
    </Router>
  );
}

export default App;