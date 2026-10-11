import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

const navTranslations = {
  ru: { register: 'Регистрация', login: 'Вход', finances: 'Мои финансы' },
  en: { register: 'Register', login: 'Login', finances: 'My Finances' },
  hy: { register: 'Գրանցում', login: 'Մուտք', finances: 'Իմ ֆինանսները' }
};

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'hy');

  const handleLangChange = (newLang) => {
    setLang(newLang);
    localStorage.setItem('lang', newLang);
  };

  const t = navTranslations[lang] || navTranslations.hy;

  return (
    <Router>
      <div>
        {/* Верхняя панель со ссылками меню и ЕДИНСТВЕННЫМ селектором языка */}
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#2c3e50', color: 'white' }}>
          <div style={{ display: 'flex', gap: '20px' }}>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>{t.register}</Link>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>{t.login}</Link>
            <Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>{t.finances}</Link>
          </div>

          <div>
            <select 
              value={lang} 
              onChange={(e) => handleLangChange(e.target.value)} 
              style={{ padding: '6px', borderRadius: '4px', cursor: 'pointer' }}
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;