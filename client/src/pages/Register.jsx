import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const translations = {
  ru: { title: 'Регистрация', name: 'Имя', email: 'Email', password: 'Пароль', registerBtn: 'Зарегистрироваться', haveAccount: 'Уже есть аккаунт?', loginLink: 'Войти' },
  en: { title: 'Register', name: 'Name', email: 'Email', password: 'Password', registerBtn: 'Register', haveAccount: 'Already have an account?', loginLink: 'Login' },
  hy: { title: 'Գրանցում', name: 'Անուն', email: 'Էլ. հասցե', password: 'Գաղտնաբառ', registerBtn: 'Գրանցվել', haveAccount: 'Արդե՞ն ունեք հաշիվ:', loginLink: 'Մուտք' }
};

function Register({ lang }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const t = translations[lang] || translations.hy;

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/users', { name, email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка регистрации');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'Arial, sans-serif', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ margin: '0 0 20px 0' }}>{t.title}</h2>

      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input 
          type="text" 
          placeholder={t.name} 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
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
        <button type="submit" style={{ padding: '10px', backgroundColor: '#2980b9', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px', fontWeight: 'bold' }}>
          {t.registerBtn}
        </button>
      </form>
      {error && <p style={{ color: 'red', marginTop: '10px', textAlign: 'center' }}>{error}</p>}
      <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '0.9em' }}>
        {t.haveAccount} <Link to="/">{t.loginLink}</Link>
      </p>
    </div>
  );
}

export default Register;