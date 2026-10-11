import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { API_URL } from '../config';

const AVATARS = [
  'https://cdn-icons-png.flaticon.com/512/847/847969.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140048.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140047.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140051.png',
  'https://cdn-icons-png.flaticon.com/512/4140/4140037.png'
];

const translations = {
  ru: {
    dashboardTitle: 'Финансовый обзор',
    currentBalance: 'Общий баланс',
    incomeTotal: 'Доходы за месяц',
    expenseTotal: 'Расходы за месяц',
    budgetLimit: 'Месячный лимит расходов',
    budgetUsed: 'израсходовано',
    budgetExceeded: 'Внимание: Лимит расходов превышен!',
    quickAdd: 'Новая транзакция',
    income: 'Доход',
    expense: 'Расход',
    amount: 'Сумма',
    description: 'Описание (напр., Зарплата, Супермаркет)',
    category: 'Категория',
    date: 'Дата',
    addBtn: 'Добавить операцию',
    success: 'Операция успешно добавлена!',
    error: 'Введите корректную сумму!',
    history: 'История операций',
    noOps: 'Транзакции не найдены',
    delete: 'Удалить',
    logout: 'Выйти',
    analytics: 'Диаграммы и аналитика',
    chartCurrency: 'Валюта:',
    noAnalytics: 'Нет данных расходов для выбранной валюты',
    loading: 'Загрузка финансовых данных...',
    searchPlaceholder: 'Поиск по описанию...',
    allTypes: 'Все типы',
    monthFilter: 'Месяц:',
    allMonths: 'Все время',
    changeAvatar: 'Сменить аватар',
    exportCsv: 'Экспорт в CSV',
    historyTab: 'История операций',
    analyticsTab: 'Диаграммы и аналитика',
    totalBalanceDesc: 'Текущий баланс по валюте AMD',
    forMonth: 'За текущий месяц',
    categoryBreakdown: 'Распределение по категориям',
    totalExpenses: 'Всего расходов',
    budgetRemaining: 'Остаток бюджета'
  },
  en: {
    dashboardTitle: 'Financial Overview',
    currentBalance: 'Total Balance',
    incomeTotal: 'Monthly Income',
    expenseTotal: 'Monthly Expense',
    budgetLimit: 'Monthly Expense Limit',
    budgetUsed: 'utilized',
    budgetExceeded: 'Warning: Expense limit exceeded!',
    quickAdd: 'New Transaction',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    description: 'Description (e.g., Salary, Groceries)',
    category: 'Category',
    date: 'Date',
    addBtn: 'Add Transaction',
    success: 'Transaction successfully added!',
    error: 'Please enter a valid amount!',
    history: 'Transaction History',
    noOps: 'No transactions found',
    delete: 'Delete',
    logout: 'Logout',
    analytics: 'Diagrams & Analytics',
    chartCurrency: 'Currency:',
    noAnalytics: 'No expense data for selected currency',
    loading: 'Loading financial data...',
    searchPlaceholder: 'Search transactions...',
    allTypes: 'All types',
    monthFilter: 'Month:',
    allMonths: 'All time',
    changeAvatar: 'Change avatar',
    exportCsv: 'Export to CSV',
    historyTab: 'Transaction History',
    analyticsTab: 'Diagrams & Analytics',
    totalBalanceDesc: 'Total balance in AMD',
    forMonth: 'For current month',
    categoryBreakdown: 'Category Distribution',
    totalExpenses: 'Total Expenses',
    budgetRemaining: 'Remaining Budget'
  },
  hy: {
    dashboardTitle: 'Ֆինանսական տեսություն',
    currentBalance: 'Ընդհանուր մնացորդ',
    incomeTotal: 'Ամսական եկամուտ',
    expenseTotal: 'Ամսական ծախս',
    budgetLimit: 'Ամսական ծախսերի սահմանաչափ',
    budgetUsed: 'օգտագործված է',
    budgetExceeded: 'Զգուշացում. Ծախսերի սահմանաչափը գերազանցված է:',
    quickAdd: 'Նոր գործարք',
    income: 'Եկամուտ',
    expense: 'Ծախս',
    amount: 'Գումար',
    description: 'Նկարագրություն (օր.՝ Աշխատավարձ, Սուպերմարկետ)',
    category: 'Կատեգորիա',
    date: 'Ամսաթիվ',
    addBtn: 'Ավելացնել գործարք',
    success: 'Գործարքը հաջողությամբ ավելացվեց!',
    error: 'Մուտքագրեք ճիշտ գումար:',
    history: 'Գործարքների պատմություն',
    noOps: 'Գործարքներ չեն գտնվել',
    delete: 'Ջնջել',
    logout: 'Դուրս գալ',
    analytics: 'Դիագրամների վերլուծություն',
    chartCurrency: 'Արժույթ՝',
    noAnalytics: 'Ընտրված արժույթով ծախսեր չկան',
    loading: 'Բեռնվում են ֆինանսական տվյալները...',
    searchPlaceholder: 'Որոնել գործարքներ...',
    allTypes: 'Բոլորը',
    monthFilter: 'Ամիս՝',
    allMonths: 'Ամբողջ ժամանակահատվածը',
    changeAvatar: 'Փոխել ավատարը',
    exportCsv: 'Արտահանել CSV',
    historyTab: 'Գործարքների պատմություն',
    analyticsTab: 'Դիագրամների վերլուծություն',
    totalBalanceDesc: 'Ընդհանուր մնացորդ AMD արժույթով',
    forMonth: 'Ընթացիկ ամսվա համար',
    categoryBreakdown: 'Ծախսերի բաշխում ըստ կատեգորիաների',
    totalExpenses: 'Ընդհանուր ծախսեր',
    budgetRemaining: 'Մնացած բյուջե'
  }
};

const categoryTranslations = {
  1: { ru: 'Зарплата', en: 'Salary', hy: 'Աշխատավարձ' },
  2: { ru: 'Фриланс', en: 'Freelance', hy: 'Ֆրիլանս' },
  3: { ru: 'Инвестиции', en: 'Investments', hy: 'Ներդրումներ' },
  4: { ru: 'Подарки', en: 'Gifts', hy: 'Նվերներ' },
  5: { ru: 'Продажа вещей', en: 'Sales', hy: 'Վաճառք' },
  6: { ru: 'Продукты и супермаркеты', en: 'Groceries', hy: 'Սնունդ և սուպերմարկետ' },
  7: { ru: 'Кафе и рестораны', en: 'Dining & Cafes', hy: 'Սրճարաններ և ռեստորաններ' },
  8: { ru: 'Транспорт и такси', en: 'Transport & Taxi', hy: 'Տրանսպորտ և տաքսի' },
  9: { ru: 'Жилье и ЖКХ', en: 'Housing & Utilities', hy: 'Կոմունալ վճարումներ' },
  10: { ru: 'Развлечения и досуг', en: 'Entertainment', hy: 'Ժամանց' },
  11: { ru: 'Здоровье и аптеки', en: 'Healthcare', hy: 'Առողջապահություն' },
  12: { ru: 'Одежда и обувь', en: 'Shopping', hy: 'Հագուստ' },
  13: { ru: 'Образование', en: 'Education', hy: 'Կրթություն' },
  14: { ru: 'Связь и интернет', en: 'Internet & Mobile', hy: 'Կապ և ինտերնետ' },
  15: { ru: 'Путешествия', en: 'Travel', hy: 'Ճանապարհորդություն' },
  16: { ru: 'Прочие расходы', en: 'Other Expenses', hy: 'Այլ ծախսեր' }
};

const CHART_COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b', '#f97316'];

function Dashboard({ lang }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(() => {
    return location.pathname === '/analytics' ? 'analytics' : 'history';
  });

  useEffect(() => {
    if (location.pathname === '/analytics') {
      setActiveTab('analytics');
    } else if (location.pathname === '/history' || location.pathname === '/transactions' || location.pathname === '/dashboard') {
      setActiveTab('history');
    }
  }, [location.pathname]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'analytics') {
      navigate('/analytics', { replace: true });
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('AMD');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  const [chartCurrency, setChartCurrency] = useState('AMD');
  const [monthlyBudget] = useState(250000);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || { id: 1, email: 'user@finance.app', avatar: AVATARS[0] };
    } catch {
      return { id: 1, email: 'user@finance.app', avatar: AVATARS[0] };
    }
  });

  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [status, setStatus] = useState('');
  const t = translations[lang] || translations.hy;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes] = await Promise.all([
        axios.get(`${API_URL}/transactions/${user.id}`),
        axios.get(`${API_URL}/categories`)
      ]);
      setTransactions(transRes.data || []);
      setCategories(catRes.data || []);
      
      const filtered = (catRes.data || []).filter(c => c.type === type);
      if (filtered.length > 0) setCategoryId(filtered[0].id);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleTypeChange = (newType) => {
    setType(newType);
    const filtered = categories.filter(c => c.type === newType);
    if (filtered.length > 0) {
      setCategoryId(filtered[0].id);
    } else {
      setCategoryId('');
    }
  };

  const getLocalizedCategoryName = (cat) => {
    if (!cat) return '';
    if (categoryTranslations[cat.id] && categoryTranslations[cat.id][lang]) {
      return categoryTranslations[cat.id][lang];
    }
    return cat.name;
  };

  const changeAvatar = async (newAvatarUrl) => {
    try {
      const res = await axios.put(`${API_URL}/users/${user.id}/avatar`, { avatar: newAvatarUrl });
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event('authChange'));
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
      await axios.post(`${API_URL}/transactions`, {
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
      setTimeout(() => setStatus(''), 3000);
      fetchData();
    } catch (error) {
      console.error(error);
      setStatus(error.response?.data?.error || 'Error');
    }
  };

  const deleteTransaction = async (id) => {
    try {
      await axios.delete(`${API_URL}/transactions/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

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
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.date ? item.date.split('T')[0] : ''
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `financial_report_${user.email ? user.email.split('@')[0] : 'user'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Balances & Calculations
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

  const totalMonthlyIncome = transactions
    .filter(item => item.type === 'income' && (item.currency || 'AMD') === 'AMD' && item.date && item.date.startsWith(currentMonthStr))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const isBudgetExceeded = totalMonthlyExpenses > monthlyBudget;
  const budgetPercentage = Math.min(Math.round((totalMonthlyExpenses / monthlyBudget) * 100), 100);

  const filteredTransactions = transactions.filter(t_item => {
    const matchesSearch = (t_item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
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
    const catName = matchedCat ? getLocalizedCategoryName(matchedCat) : 'Other';
    if (!chartDataMap[catName]) chartDataMap[catName] = 0;
    chartDataMap[catName] += Number(item.amount);
  });

  const totalExpenseInCurrency = expenseTransactions.reduce((sum, it) => sum + Number(it.amount), 0);

  const chartData = Object.keys(chartDataMap).map(name => ({
    name,
    value: chartDataMap[name],
    percent: totalExpenseInCurrency > 0 ? (chartDataMap[name] / totalExpenseInCurrency) * 100 : 0
  })).sort((a, b) => b.value - a.value);

  const currentCategories = categories.filter(c => c.type === type);
  const formatMoney = (val) => Number(val || 0).toLocaleString('ru-RU');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '120px', fontSize: '1.1rem', color: '#64748b', fontWeight: 600 }}>
        {t.loading}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1240px', margin: '30px auto', padding: '0 24px 60px' }}>
      
      {/* 1. Header Profile & Title Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <img 
              src={user.avatar || AVATARS[0]} 
              alt="Avatar" 
              style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #6366f1', boxShadow: '0 4px 12px rgba(99, 102, 241, 0.25)' }} 
            />
            <span style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '10px',
              padding: '2px 5px',
              borderRadius: '6px',
              fontWeight: 700
            }}>
              Edit
            </span>
          </div>

          <div>
            <h1 style={{ fontSize: '1.6rem', color: '#0f172a', fontWeight: 800 }}>{t.dashboardTitle}</h1>
            <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{user.email}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={handleLogout}
            style={{
              padding: '9px 18px',
              backgroundColor: '#fee2e2',
              color: '#dc2626',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              transition: 'background-color 0.2s ease'
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fintech-card" style={{ padding: '18px 24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155' }}>{t.changeAvatar}:</span>
          <div style={{ display: 'flex', gap: '12px' }}>
            {AVATARS.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                alt="option" 
                onClick={() => changeAvatar(url)}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  border: user.avatar === url ? '3px solid #10b981' : '2px solid transparent',
                  transition: 'transform 0.15s ease'
                }} 
              />
            ))}
          </div>
        </div>
      )}

      {/* 2. TAB CONTROLS (Գործարքների պատմություն & Դիագրամների վերլուծություն) */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '26px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '14px',
        flexWrap: 'wrap'
      }}>
        <button
          type="button"
          onClick={() => handleTabSwitch('history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            backgroundColor: activeTab === 'history' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'history' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'history' ? '0 4px 14px rgba(79, 70, 229, 0.35)' : '0 1px 3px rgba(0,0,0,0.05)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: activeTab === 'history' ? '#4f46e5' : '#e2e8f0',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t.historyTab}
          <span style={{
            fontSize: '0.75rem',
            padding: '2px 7px',
            borderRadius: '10px',
            backgroundColor: activeTab === 'history' ? 'rgba(255, 255, 255, 0.25)' : '#e2e8f0',
            color: activeTab === 'history' ? '#ffffff' : '#475569'
          }}>
            {filteredTransactions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('analytics')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '11px 22px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 700,
            backgroundColor: activeTab === 'analytics' ? '#4f46e5' : '#ffffff',
            color: activeTab === 'analytics' ? '#ffffff' : '#64748b',
            boxShadow: activeTab === 'analytics' ? '0 4px 14px rgba(79, 70, 229, 0.35)' : '0 1px 3px rgba(0,0,0,0.05)',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: activeTab === 'analytics' ? '#4f46e5' : '#e2e8f0',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
            <path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          {t.analyticsTab}
        </button>
      </div>

      {/* 3. FINANCIAL KPI CARDS (Bank card removed, replaced by clean Total Balance metric) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {/* KPI 0: Total Balance (Clean modern Fintech Card, NO bank card elements) */}
        <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{t.currentBalance}</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4f46e5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', marginTop: '10px', letterSpacing: '-0.02em' }}>
              {formatMoney(balances['AMD'] || 0)} <span style={{ fontSize: '1rem', color: '#4f46e5', fontWeight: 700 }}>AMD</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>
            {t.totalBalanceDesc}
          </div>
        </div>

        {/* KPI 1: Monthly Income */}
        <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{t.incomeTotal}</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#059669', marginTop: '10px', letterSpacing: '-0.02em' }}>
              +{formatMoney(totalMonthlyIncome)} <span style={{ fontSize: '1rem', color: '#10b981', fontWeight: 700 }}>AMD</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>
            {t.forMonth} ({currentMonthStr})
          </div>
        </div>

        {/* KPI 2: Monthly Expenses */}
        <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{t.expenseTotal}</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#fff1f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#e11d48', marginTop: '10px', letterSpacing: '-0.02em' }}>
              -{formatMoney(totalMonthlyExpenses)} <span style={{ fontSize: '1rem', color: '#f43f5e', fontWeight: 700 }}>AMD</span>
            </div>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '16px' }}>
            {t.forMonth} ({currentMonthStr})
          </div>
        </div>

        {/* KPI 3: Budget Limit Progress */}
        <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 700 }}>{t.budgetLimit}</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isBudgetExceeded ? '#e11d48' : '#4f46e5' }}>
                {budgetPercentage}% {t.budgetUsed}
              </span>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', marginTop: '10px', letterSpacing: '-0.02em' }}>
              {formatMoney(monthlyBudget)} <span style={{ fontSize: '1rem', color: '#64748b', fontWeight: 700 }}>AMD</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', marginTop: '14px', overflow: 'hidden' }}>
              <div style={{
                width: `${budgetPercentage}%`,
                height: '100%',
                backgroundColor: isBudgetExceeded ? '#e11d48' : budgetPercentage > 80 ? '#f59e0b' : '#10b981',
                borderRadius: '4px',
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          {isBudgetExceeded ? (
            <div style={{ fontSize: '0.78rem', color: '#e11d48', fontWeight: 700, marginTop: '10px' }}>
              {t.budgetExceeded}
            </div>
          ) : (
            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '10px' }}>
              {t.budgetRemaining}: {formatMoney(Math.max(0, monthlyBudget - totalMonthlyExpenses))} AMD
            </div>
          )}
        </div>
      </div>

      {/* 4. VIEW CONTENT DEPENDING ON ACTIVE TAB */}
      {activeTab === 'history' ? (
        /* ================= HISTORY & TRANSACTIONS VIEW ================= */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(320px, 380px) 1fr',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Quick Add Form on the Left */}
          <div className="fintech-card" style={{ padding: '26px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '18px', color: '#0f172a' }}>{t.quickAdd}</h2>
            
            <form onSubmit={addTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Type Switcher */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: '#f1f5f9',
                padding: '4px',
                borderRadius: '12px',
                gap: '6px'
              }}>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  style={{
                    padding: '9px',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: type === 'income' ? '#059669' : 'transparent',
                    color: type === 'income' ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t.income}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  style={{
                    padding: '9px',
                    borderRadius: '9px',
                    border: 'none',
                    backgroundColor: type === 'expense' ? '#e11d48' : 'transparent',
                    color: type === 'expense' ? '#ffffff' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t.expense}
                </button>
              </div>

              {/* Currency Selector Pills */}
              <div style={{ display: 'flex', gap: '6px' }}>
                {['AMD', 'USD', 'EUR', 'RUB'].map((curr) => (
                  <button
                    type="button"
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    style={{
                      flex: 1,
                      padding: '7px 4px',
                      borderRadius: '8px',
                      border: '1.5px solid',
                      borderColor: currency === curr ? '#4f46e5' : '#e2e8f0',
                      backgroundColor: currency === curr ? '#eef2ff' : '#ffffff',
                      color: currency === curr ? '#4f46e5' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    {curr}
                  </button>
                ))}
              </div>

              {/* Amount & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    {t.amount}
                  </label>
                  <input 
                    type="number" 
                    step="any"
                    placeholder="0.00"
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    required 
                    className="fintech-input"
                    style={{ fontWeight: 700, fontSize: '1rem' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    {t.category}
                  </label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    className="fintech-input"
                    style={{ height: '46px', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    {currentCategories.map(c => (
                      <option key={c.id} value={c.id}>{getLocalizedCategoryName(c)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.description}
                </label>
                <input 
                  type="text" 
                  placeholder={t.description} 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  className="fintech-input"
                />
              </div>

              {/* Date */}
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.date}
                </label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                  className="fintech-input"
                />
              </div>

              <button type="submit" className="fintech-btn-primary" style={{ height: '46px', marginTop: '4px' }}>
                {t.addBtn}
              </button>
            </form>

            {status && (
              <div style={{
                marginTop: '14px',
                padding: '10px 14px',
                borderRadius: '8px',
                textAlign: 'center',
                fontWeight: 600,
                fontSize: '0.85rem',
                backgroundColor: status === t.success ? '#ecfdf5' : '#fef2f2',
                color: status === t.success ? '#059669' : '#dc2626'
              }}>
                {status}
              </div>
            )}
          </div>

          {/* Transaction History Feed on the Right */}
          <div className="fintech-card" style={{ padding: '26px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>{t.history}</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Всего: {filteredTransactions.length}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={exportToCSV}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#f1f5f9',
                    color: '#334155',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {t.exportCsv}
                </button>

                <input 
                  type="text" 
                  placeholder={t.searchPlaceholder} 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.85rem',
                    minWidth: '150px'
                  }}
                />

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)} 
                  style={{ padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                >
                  <option value="all">{t.allTypes}</option>
                  <option value="income">{t.income}</option>
                  <option value="expense">{t.expense}</option>
                </select>

                <input 
                  type="month" 
                  value={selectedMonth === 'all' ? '' : selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value || 'all')} 
                  style={{ padding: '7px 8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                />
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#94a3b8', padding: '60px 0', fontSize: '0.95rem' }}>
                {t.noOps}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredTransactions.map(t_item => {
                  const matchedCat = categories.find(c => c.id === t_item.category_id);
                  const catName = matchedCat ? getLocalizedCategoryName(matchedCat) : '';
                  const formattedDate = t_item.date ? new Date(t_item.date).toLocaleDateString() : '';

                  return (
                    <div 
                      key={t_item.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        backgroundColor: '#ffffff',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Category Avatar Badge */}
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '10px',
                          backgroundColor: t_item.type === 'income' ? '#ecfdf5' : '#fff1f2',
                          color: t_item.type === 'income' ? '#059669' : '#e11d48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.95rem'
                        }}>
                          {catName ? catName.charAt(0).toUpperCase() : (t_item.type === 'income' ? 'I' : 'E')}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                            {t_item.description}
                          </div>
                          <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>
                            {catName && <span style={{ fontWeight: 600 }}>{catName}</span>}
                            <span>•</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '1rem',
                          color: t_item.type === 'income' ? '#059669' : '#e11d48'
                        }}>
                          {t_item.type === 'income' ? '+' : '-'}{formatMoney(t_item.amount)} {t_item.currency || 'AMD'}
                        </div>

                        <button 
                          onClick={() => deleteTransaction(t_item.id)}
                          title={t.delete}
                          style={{
                            padding: '6px 10px',
                            backgroundColor: '#f8fafc',
                            color: '#94a3b8',
                            border: '1px solid #e2e8f0',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {t.delete}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ================= DIAGRAMS & ANALYTICS VIEW ================= */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Main Pie Chart Card */}
          <div className="fintech-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', color: '#0f172a' }}>{t.analytics}</h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  {t.totalExpenses}: <strong style={{ color: '#e11d48' }}>{formatMoney(totalExpenseInCurrency)} {chartCurrency}</strong>
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{t.chartCurrency}</span>
                <select 
                  value={chartCurrency} 
                  onChange={(e) => setChartCurrency(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f8fafc',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  <option value="AMD">AMD</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="RUB">RUB</option>
                </select>
              </div>
            </div>

            {chartData.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', minHeight: '320px' }}>
                {t.noAnalytics}
              </div>
            ) : (
              <div style={{ width: '100%', height: '340px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={120}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${percent.toFixed(0)}%)`}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `${formatMoney(val)} ${chartCurrency}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Category Distribution Breakdown */}
          <div className="fintech-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '20px' }}>
              {t.categoryBreakdown}
            </h2>

            {chartData.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', minHeight: '320px' }}>
                {t.noAnalytics}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {chartData.map((cat, idx) => {
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{cat.name}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>
                          {formatMoney(cat.value)} <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{chartCurrency}</span>
                          <span style={{ marginLeft: '8px', fontSize: '0.8rem', color: color, fontWeight: 800 }}>
                            ({cat.percent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${cat.percent}%`,
                          height: '100%',
                          backgroundColor: color,
                          borderRadius: '3px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

export default Dashboard;