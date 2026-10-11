import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const translations = {
  ru: {
    title: 'Панель управления',
    balance: 'Текущий баланс',
    noOps: 'Нет операций',
    addOperation: 'Добавить операцию',
    income: 'Доход',
    expense: 'Расход',
    amount: 'Сумма',
    description: 'Описание (например, Зарплата, Обед)',
    date: 'Дата',
    addBtn: 'Добавить операцию',
    success: 'Операция успешно добавлена!',
    error: 'Введите корректную сумму!',
    history: 'История операций',
    delete: 'Удалить',
    logout: 'Выйти',
    noCategories: 'Нет доступных категорий',
    analytics: 'Аналитика расходов по категориям',
    chartCurrency: 'Валюта:',
    noAnalytics: 'Нет данных расходов для выбранной валюты',
    loading: 'Загрузка данных...',
    searchPlaceholder: 'Поиск по описанию...',
    allTypes: 'Все типы',
    monthFilter: 'Месяц:',
    allMonths: 'Все время',
    budgetLabel: 'Лимит расходов на месяц:',
    budgetExceeded: '⚠️ Внимание: Лимит расходов превышен!',
    changeAvatar: 'Сменить аватар',
    exportCsv: '📥 Экспорт в CSV'
  },
  en: {
    title: 'Dashboard',
    balance: 'Current Balance',
    noOps: 'No transactions',
    addOperation: 'Add Transaction',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    description: 'Description (e.g., Salary, Lunch)',
    date: 'Date',
    addBtn: 'Add Transaction',
    success: 'Transaction successfully added!',
    error: 'Please enter a valid amount!',
    history: 'Transaction History',
    delete: 'Delete',
    logout: 'Logout',
    noCategories: 'No categories available',
    analytics: 'Expense Analytics by Category',
    chartCurrency: 'Currency:',
    noAnalytics: 'No expense data for selected currency',
    loading: 'Loading data...',
    searchPlaceholder: 'Search by description...',
    allTypes: 'All types',
    monthFilter: 'Month:',
    allMonths: 'All time',
    budgetLabel: 'Monthly Expense Budget Limit:',
    budgetExceeded: '⚠️ Warning: Expense limit exceeded!',
    changeAvatar: 'Change avatar',
    exportCsv: '📥 Export to CSV'
  },
  hy: {
    title: 'Կառավարման վահանակ',
    balance: 'Ընթացիկ մնացորդը',
    noOps: 'Գործարքներ չկան',
    addOperation: 'Ավելացնել գործարք',
    income: 'Եկամուտ',
    expense: 'Ծախս',
    amount: 'Գումար',
    description: 'Նկարագրություն (օրինակ՝ Աշխատավարձ)',
    date: 'Ամսաթիվ',
    addBtn: 'Ավելացնել գործարք',
    success: 'Գործարքը հաջողությամբ ավելացվեց!',
    error: 'Մուտքագրեք ճիշտ գումար:',
    history: 'Գործարքների պատմություն',
    delete: 'Ջնջել',
    logout: 'Դուրս գալ',
    noCategories: 'Կատեգորիաներ չկան',
    analytics: 'Ծախսերի վերլուծություն ըստ կատեգորիաների',
    chartCurrency: 'Արժույթ՝',
    noAnalytics: 'Ընտրված արժույթով ծախսեր չկան',
    loading: 'Բեռնվում է...',
    searchPlaceholder: 'Որոնել ըստ նկարագրության...',
    allTypes: 'Բոլորը',
    monthFilter: 'Ամիս՝',
    allMonths: 'Ամբողջ ժամանակահատվածը',
    budgetLabel: 'Ամսական ծախսերի սահմանաչափ (բյուջե):',
    budgetExceeded: '⚠️ Զգուշացում. Ծախսերի սահմանաչափը գերազանցված է:',
    changeAvatar: 'Փոխել ավատարը',
    exportCsv: '📥 Արտահանել CSV'
  }
};

const categoryTranslations = {
  1: { ru: 'Зарплата', en: 'Salary', hy: 'Աշխատավարձ' },
  2: { ru: 'Фриланс', en: 'Freelance', hy: 'Ֆրիլանս' },
  3: { ru: 'Инвестиции', en: 'Investments', hy: 'Ներդրումներ' },
  4: { ru: 'Подарки', en: 'Gifts', hy: 'Նվերներ' },
  5: { ru: 'Продажа вещей', en: 'Selling items', hy: 'Իրերի վաճառք' },
  6: { ru: 'Продукты и супермаркеты', en: 'Groceries & Supermarkets', hy: 'Մթերք և սուպերմարկետներ' },
  7: { ru: 'Кафе, рестораны и доставка', en: 'Cafes, Restaurants & Delivery', hy: 'Սրճարաններ և ռեստորաններ' },
  8: { ru: 'Транспорт и такси', en: 'Transport & Taxi', hy: 'Տրանսպորտ և տաքսի' },
  9: { ru: 'Жилье и ЖКХ', en: 'Housing & Utilities', hy: 'Բնակարան և կոմունալ' },
  10: { ru: 'Развлечения и досуг', en: 'Entertainment & Leisure', hy: 'Ժամանց' },
  11: { ru: 'Здоровье и аптеки', en: 'Health & Pharmacies', hy: 'Առողջություն և դեղատներ' },
  12: { ru: 'Одежда и обувь', en: 'Clothing & Shoes', hy: 'Հագուստ և կոշիկ' },
  13: { ru: 'Образование и курсы', en: 'Education & Courses', hy: 'Կրթություն' },
  14: { ru: 'Связь, интернет и подписки', en: 'Communication & Subscriptions', hy: 'Կապ և ինտերնետ' },
  15: { ru: 'Путешествия и отдых', en: 'Travel & Vacation', hy: 'Ճանապարհորդություն' },
  16: { ru: 'Прочие расходы', en: 'Other Expenses', hy: 'Այլ ծախսեր' }
};

const COLORS = ['#3498db', '#e74c3c', '#2ecc71', '#f1c40f', '#9b59b6', '#e67e22', '#1abc9c', '#34495e'];

const AVATARS = [
  'https://cdn-icons-png.flaticon.com/512/847/847969.png',
  'https://cdn-icons-png.flaticon.com/512/847/847970.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140037.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140051.png'
];

function Dashboard({ lang }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [type, setType] = useState('income');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('AMD');
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [chartCurrency, setChartCurrency] = useState('AMD');
  const [monthlyBudget, setMonthlyBudget] = useState(150000);

  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')) || { id: 1, email: 'user@mail.com', avatar: AVATARS[0] });
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const t = translations[lang] || translations.hy;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes] = await Promise.all([
        axios.get(`http://localhost:5000/transactions/${user.id}`),
        axios.get('http://localhost:5000/categories')
      ]);
      
      setTransactions(transRes.data);
      setCategories(catRes.data || []);
      
      const filtered = (catRes.data || []).filter(c => c.type === type);
      if (filtered.length > 0) setCategoryId(filtered[0].id);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user.id]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const filtered = categories.filter(c => c.type === newType);
    if (filtered.length > 0) setCategoryId(filtered[0].id);
  };

  const formatMoney = (sum) => {
    return Number(sum).toLocaleString('ru-RU');
  };

  const getCurrencySymbol = (curr) => {
    switch (curr) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'RUB': return '₽';
      case 'AMD': 
      default: return '֏';
    }
  };

  const getLocalizedCategoryName = (cat) => {
    if (categoryTranslations[cat.id] && categoryTranslations[cat.id][lang]) {
      return categoryTranslations[cat.id][lang];
    }
    return cat.name;
  };

  const changeAvatar = async (newAvatarUrl) => {
    try {
      const res = await axios.put(`http://localhost:5000/users/${user.id}/avatar`, { avatar: newAvatarUrl });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      setShowAvatarPicker(false);
    } catch (err) {
      console.error(err);
    }
  };

  const addTransaction = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setStatus(t.error);
      return;
    }

    try {
      await axios.post('http://localhost:5000/transactions', {
        user_id: user.id,
        category_id: categoryId || null,
        type,
        amount,
        description,
        currency,
        date
      });
      setStatus(t.success);
      setAmount('');
      setDescription('');
      setDate(todayStr);
      fetchData();
    } catch (error) {
      console.error(error);
      setStatus('Error');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/transactions/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  // Функция правильного экспорта в CSV с поддержкой UTF-8 BOM для Excel
  const exportToCSV = () => {
    const headers = ['ID', 'Type', 'Category', 'Amount', 'Currency', 'Description', 'Date'];
    const rows = filteredTransactions.map(item => {
      const matchedCat = categories.find(c => c.id === item.category_id);
      const catName = matchedCat ? getLocalizedCategoryName(matchedCat) : '';
      return [
        item.id,
        item.type,
        `"${catName}"`,
        item.amount,
        item.currency || 'AMD',
        `"${item.description.replace(/"/g, '""')}"`,
        item.date ? item.date.split('T')[0] : ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `finance_report_${user.email.split('@')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const balances = transactions.reduce((acc, item) => {
    const curr = item.currency || 'AMD';
    if (!acc[curr]) acc[curr] = 0;
    return item.type === 'income' 
      ? { ...acc, [curr]: acc[curr] + Number(item.amount) }
      : { ...acc, [curr]: acc[curr] - Number(item.amount) };
  }, {});

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const totalMonthlyExpenses = transactions
    .filter(item => item.type === 'expense' && (item.currency || 'AMD') === 'AMD' && item.date && item.date.startsWith(currentMonthStr))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const isBudgetExceeded = totalMonthlyExpenses > monthlyBudget;

  const filteredTransactions = transactions.filter(t_item => {
    const matchesSearch = t_item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || t_item.type === filterType;
    const matchesMonth = selectedMonth === 'all' || (t_item.date && t_item.date.startsWith(selectedMonth));
    return matchesSearch && matchesType && matchesMonth;
  });

  const expenseTransactions = transactions.filter(
    item => item.type === 'expense' && (item.currency || 'AMD') === chartCurrency
  );
  
  const chartDataMap = {};
  expenseTransactions.forEach(item => {
    const matchedCat = categories.find(c => c.id === item.category_id);
    const catName = matchedCat ? getLocalizedCategoryName(matchedCat) : 'Другое';
    if (!chartDataMap[catName]) chartDataMap[catName] = 0;
    chartDataMap[catName] += Number(item.amount);
  });

  const chartData = Object.keys(chartDataMap).map(name => ({
    name,
    value: chartDataMap[name]
  }));

  const currentCategories = categories.filter(c => c.type === type);

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '100px', fontSize: '1.2em', color: '#555' }}>{t.loading}</div>;
  }

  return (
    <div style={{ maxWidth: '700px', margin: '30px auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', padding: '0 15px' }}>
      
      {/* Шапка профиля */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '15px 20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <img 
              src={user.avatar || AVATARS[0]} 
              alt="Avatar" 
              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #3498db' }} 
            />
            <span style={{ position: 'absolute', bottom: 0, right: 0, background: '#3498db', color: '#fff', fontSize: '10px', padding: '2px 4px', borderRadius: '50%' }}>⚙️</span>
          </div>
          <div>
            <h2 style={{ margin: '0 0 3px 0', fontSize: '1.2em', color: '#2c3e50' }}>{t.title}</h2>
            <span style={{ fontSize: '0.85em', color: '#7f8c8d' }}>{user.email}</span>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          style={{ padding: '8px 16px', backgroundColor: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold' }}
        >
          {t.logout}
        </button>
      </div>

      {showAvatarPicker && (
        <div style={{ padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9em', fontWeight: 'bold' }}>{t.changeAvatar}:</span>
          {AVATARS.map((url, idx) => (
            <img 
              key={idx} 
              src={url} 
              alt="option" 
              onClick={() => changeAvatar(url)}
              style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', border: user.avatar === url ? '3px solid #27ae60' : '2px solid transparent' }} 
            />
          ))}
        </div>
      )}

      {/* Баланс и бюджет */}
      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '1.1em' }}>{t.balance}</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {Object.keys(balances).length === 0 ? (
            <p style={{ color: '#7f8c8d' }}>{t.noOps}</p>
          ) : (
            Object.entries(balances).map(([curr, sum]) => (
              <div key={curr} style={{ flex: '1 1 140px', padding: '12px 15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: `4px solid ${sum >= 0 ? '#27ae60' : '#e74c3c'}` }}>
                <div style={{ fontSize: '0.8em', color: '#7f8c8d' }}>{curr}</div>
                <div style={{ fontSize: '1.3em', fontWeight: 'bold', color: sum >= 0 ? '#27ae60' : '#e74c3c' }}>
                  {formatMoney(sum)} {getCurrencySymbol(curr)}
                </div>
              </div>
            ))
          )}
        </div>

        <div style={{ marginTop: '20px', padding: '12px', backgroundColor: isBudgetExceeded ? '#fadbd8' : '#eafaf1', borderRadius: '8px', border: `1px solid ${isBudgetExceeded ? '#f5b7b1' : '#a9dfbf'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
            <span style={{ fontSize: '0.9em', fontWeight: 'bold', color: isBudgetExceeded ? '#c0392b' : '#196f3d' }}>
              {t.budgetLabel} ({formatMoney(totalMonthlyExpenses)} / {formatMoney(monthlyBudget)} ֏)
            </span>
            <input 
              type="number" 
              value={monthlyBudget} 
              onChange={(e) => setMonthlyBudget(Number(e.target.value))} 
              style={{ width: '90px', padding: '4px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '0.9em' }}
            />
          </div>
          {isBudgetExceeded && (
            <div style={{ fontSize: '0.85em', color: '#c0392b', fontWeight: 'bold', marginTop: '5px' }}>
              {t.budgetExceeded}
            </div>
          )}
        </div>
      </div>

      {/* График аналитики */}
      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={{ fontSize: '1.1em', margin: 0, color: '#2c3e50' }}>{t.analytics}</h3>
          <div>
            <span style={{ fontSize: '0.85em', marginRight: '8px', color: '#7f8c8d' }}>{t.chartCurrency}</span>
            <select 
              value={chartCurrency} 
              onChange={(e) => setChartCurrency(e.target.value)}
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="AMD">AMD (֏)</option>
              <option value="RUB">RUB (₽)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>

        {chartData.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#7f8c8d', fontSize: '0.9em', padding: '30px 0' }}>{t.noAnalytics}</p>
        ) : (
          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Форма добавления */}
      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#2c3e50', fontSize: '1.1em' }}>{t.addOperation}</h3>
        <form onSubmit={addTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select value={type} onChange={(e) => handleTypeChange(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="income">{t.income}</option>
              <option value="expense">{t.expense}</option>
            </select>

            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              {currentCategories.length === 0 ? (
                <option value="">{t.noCategories}</option>
              ) : (
                currentCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{getLocalizedCategoryName(cat)}</option>
                ))
              )}
            </select>

            <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="AMD">AMD (֏)</option>
              <option value="RUB">RUB (₽)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="date" 
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
            <input 
              type="number" 
              placeholder={t.amount} 
              value={amount} 
              onChange={(e) => setAmount(e.target.value)} 
              required 
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
            />
          </div>

          <input 
            type="text" 
            placeholder={t.description} 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }} 
          />
          
          <button type="submit" style={{ padding: '12px', backgroundColor: '#27ae60', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '6px', fontWeight: 'bold', fontSize: '1em' }}>
            {t.addBtn}
          </button>
        </form>
        {status && <p style={{ fontWeight: 'bold', color: status === t.success ? 'green' : 'red', textAlign: 'center', marginTop: '10px' }}>{status}</p>}
      </div>

      {/* История с поиском, фильтрами и кнопкой экспорта */}
      <div style={{ padding: '20px', backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
          <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '1.1em' }}>{t.history}</h3>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button 
              onClick={exportToCSV}
              style={{ padding: '6px 12px', backgroundColor: '#2980b9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.85em' }}
            >
              {t.exportCsv}
            </button>

            <input 
              type="text" 
              placeholder={t.searchPlaceholder} 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.9em' }}
            />
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}>
              <option value="all">{t.allTypes}</option>
              <option value="income">{t.income}</option>
              <option value="expense">{t.expense}</option>
            </select>
            <input 
              type="month" 
              value={selectedMonth === 'all' ? '' : selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value || 'all')} 
              style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {filteredTransactions.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#7f8c8d', padding: '20px 0' }}>{t.noOps}</p>
          ) : (
            filteredTransactions.map(t_item => {
              const matchedCategory = categories.find(c => c.id === t_item.category_id);
              const currSymbol = getCurrencySymbol(t_item.currency);
              const formattedDate = t_item.date ? new Date(t_item.date).toLocaleDateString() : '';

              return (
                <li key={t_item.id} style={{ 
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 15px', 
                  marginBottom: '10px', 
                  backgroundColor: '#fdfefe', 
                  borderRadius: '8px',
                  border: '1px solid #edf2f7',
                  borderLeft: `5px solid ${t_item.type === 'income' ? '#27ae60' : '#e74c3c'}`,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)' 
                }}>
                  <div>
                    <strong style={{ color: '#2c3e50' }}>{t_item.description}</strong> 
                    {matchedCategory && <span style={{ color: '#7f8c8d', fontSize: '0.85em' }}> ({getLocalizedCategoryName(matchedCategory)})</span>}
                    <div style={{ fontSize: '0.8em', color: '#95a5a6' }}>{formattedDate}</div>
                    <div style={{ fontWeight: 'bold', color: t_item.type === 'income' ? '#27ae60' : '#e74c3c', marginTop: '2px' }}>
                      {t_item.type === 'income' ? '+' : '-'}{formatMoney(t_item.amount)} {currSymbol}
                    </div>
                  </div>
                  <button 
                    onClick={() => deleteTransaction(t_item.id)}
                    style={{ backgroundColor: '#ff7675', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '6px', fontSize: '0.85em', fontWeight: 'bold' }}
                  >
                    {t.delete}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </div>

    </div>
  );
}

export default Dashboard;