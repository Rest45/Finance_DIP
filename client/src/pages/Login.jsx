import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const translations = {
  ru: { title: 'Вход в систему', email: 'Email', password: 'Пароль', loginBtn: 'Войти', noAccount: 'Нет аккаунта?', registerLink: 'Зарегистрироваться' },
  en: { title: 'Login', email: 'Email', password: 'Password', loginBtn: 'Login', noAccount: "Don't have an account?", registerLink: 'Register' },
  hy: { title: 'Մուտք համակարգ', email: 'Էլ. հասցե', password: 'Գաղտնաբառ', loginBtn: 'Մուտք', noAccount: 'Չունե՞ք հաշիվ:', registerLink: 'Գրանցվել' }
};

function Login({ lang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const t = translations[lang] || translations.hy;

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка входа');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ margin: '0 0 20px 0' }}>{t.title}</h2>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="email" 
          placeholder={t.email} 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input 
          type="password" 
          placeholder={t.password} 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          {t.loginBtn}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9em' }}>
        {t.noAccount} <Link to="/register">{t.registerLink}</Link>
      </p>
    </div>
  );
}

export default Login;