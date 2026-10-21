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
    currentBalance: 'Баланс счета',
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
    historyTab: 'Операции',
    analyticsTab: 'Аналитика',
    goalsTab: 'Копилки и цели',
    subsTab: 'Подписки',
    budgetsTab: 'Лимиты категорий',
    totalBalanceDesc: 'Текущий баланс по валюте AMD',
    forMonth: 'За текущий месяц',
    categoryBreakdown: 'Распределение по категориям',
    totalExpenses: 'Всего расходов',
    budgetRemaining: 'Остаток бюджета',

    // Core Finance & Net Worth
    netWorthTitle: 'Общий капитал (Net Worth)',
    netWorthDesc: 'Суммарный баланс всех счетов в пересчете по курсам валют',
    liveRatesTitle: 'Курсы валют',
    baseCurrency: 'Базовая валюта:',

    // Quick Presets
    quickPresetsTitle: 'Быстрые шаблоны (1 клик):',
    presetCoffee: 'Кофе',
    presetLunch: 'Обед',
    presetTaxi: 'Такси',
    presetGroceries: 'Продукты',
    presetFuel: 'Бензин',
    presetSalary: 'Зарплата',

    // Savings Goals
    addGoalTitle: 'Создать новую цель / копилку',
    goalTitle: 'Название цели (напр., MacBook, Отпуск)',
    targetAmount: 'Целевая сумма',
    initialAmount: 'Начальная сумма',
    deadline: 'Срок (дедлайн)',
    saveGoalBtn: 'Создать копилку',
    goalProgress: 'Накоплено',
    goalRemaining: 'Осталось собрать',
    depositBtn: 'Пополнить / Снять',
    goalAchieved: 'Цель достигнута! 🎉',
    noGoals: 'У вас пока нет активных целей. Создайте первую копилку!',
    daysLeft: 'дн. осталось',
    daysOverdue: 'Срок истек',
    noDeadline: 'Бессрочно',
    depositSuccess: 'Баланс цели обновлен!',

    // Subscriptions
    addSubTitle: 'Добавить регулярный платеж / подписку',
    subName: 'Название сервиса (напр., Netflix, Spotify, Аренда)',
    billingCycle: 'Периодичность',
    cycleMonthly: 'Ежемесячно',
    cycleYearly: 'Ежегодно',
    cycleWeekly: 'Еженедельно',
    nextBillingDate: 'Следующее списание',
    saveSubBtn: 'Добавить подписку',
    monthlySubsTotal: 'Всего на подписки в месяц',
    activeSubsCount: 'Активных сервисов',
    payNowBtn: 'Оплатить сейчас',
    paySubSuccess: 'Подписка оплачена! Создан расход и обновлена дата.',
    subStatusActive: 'Активна',
    subStatusPaused: 'Пауза',
    noSubs: 'У вас нет регулярных подписок. Добавьте первый сервис!',
    upcomingBadge: 'Скоро списание!',

    // Category Budgets
    addCatBudgetTitle: 'Установить месячный лимит по категории',
    catBudgetAmount: 'Лимит на месяц',
    saveCatBudgetBtn: 'Сохранить лимит',
    spentSoFar: 'Потрачено в этом месяце',
    limitExceeded: 'Лимит превышен!',
    noCatBudgets: 'Лимиты по отдельным категориям не установлены.'
  },
  en: {
    dashboardTitle: 'Financial Overview',
    currentBalance: 'Account Balance',
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
    historyTab: 'Transactions',
    analyticsTab: 'Analytics',
    goalsTab: 'Savings Goals',
    subsTab: 'Subscriptions',
    budgetsTab: 'Category Budgets',
    totalBalanceDesc: 'Total balance in AMD',
    forMonth: 'For current month',
    categoryBreakdown: 'Category Distribution',
    totalExpenses: 'Total Expenses',
    budgetRemaining: 'Remaining Budget',

    // Core Finance & Net Worth
    netWorthTitle: 'Consolidated Net Worth',
    netWorthDesc: 'Total wealth across all currencies converted in real-time',
    liveRatesTitle: 'Exchange Rates',
    baseCurrency: 'Base currency:',

    // Quick Presets
    quickPresetsTitle: 'Quick 1-Click Presets:',
    presetCoffee: 'Coffee',
    presetLunch: 'Lunch',
    presetTaxi: 'Taxi',
    presetGroceries: 'Groceries',
    presetFuel: 'Gas/Fuel',
    presetSalary: 'Salary',

    // Savings Goals
    addGoalTitle: 'Create New Savings Goal / Piggy Bank',
    goalTitle: 'Goal Title (e.g., MacBook, Dubai Vacation)',
    targetAmount: 'Target Amount',
    initialAmount: 'Initial Amount',
    deadline: 'Target Date',
    saveGoalBtn: 'Create Goal',
    goalProgress: 'Saved',
    goalRemaining: 'Remaining to save',
    depositBtn: 'Deposit / Withdraw',
    goalAchieved: 'Goal Achieved! 🎉',
    noGoals: 'No active savings goals yet. Create your first piggy bank!',
    daysLeft: 'days left',
    daysOverdue: 'Overdue',
    noDeadline: 'No deadline',
    depositSuccess: 'Goal balance updated!',

    // Subscriptions
    addSubTitle: 'Add Recurring Payment / Subscription',
    subName: 'Service Name (e.g., Netflix, Spotify, Rent)',
    billingCycle: 'Billing Cycle',
    cycleMonthly: 'Monthly',
    cycleYearly: 'Yearly',
    cycleWeekly: 'Weekly',
    nextBillingDate: 'Next Billing Date',
    saveSubBtn: 'Add Subscription',
    monthlySubsTotal: 'Total monthly subscription cost',
    activeSubsCount: 'Active Subscriptions',
    payNowBtn: 'Pay Now',
    paySubSuccess: 'Subscription paid! Expense recorded and date updated.',
    subStatusActive: 'Active',
    subStatusPaused: 'Paused',
    noSubs: 'No recurring subscriptions tracked yet. Add your first service!',
    upcomingBadge: 'Due soon!',

    // Category Budgets
    addCatBudgetTitle: 'Set Monthly Limit for Category',
    catBudgetAmount: 'Monthly Limit',
    saveCatBudgetBtn: 'Save Limit',
    spentSoFar: 'Spent this month',
    limitExceeded: 'Over Budget!',
    noCatBudgets: 'No category-specific budgets set.'
  },
  hy: {
    dashboardTitle: 'Ֆինանսական տեսություն',
    currentBalance: 'Հաշվեկշիռ',
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
    historyTab: 'Գործարքներ',
    analyticsTab: 'Անալիտիկա',
    goalsTab: 'Կուտակումներ և նպատակներ',
    subsTab: 'Բաժանորդագրություններ',
    budgetsTab: 'Կատեգորիաների լիմիտներ',
    totalBalanceDesc: 'Ընդհանուր մնացորդ AMD արժույթով',
    forMonth: 'Ընթացիկ ամսվա համար',
    categoryBreakdown: 'Ծախսերի բաշխում ըստ կատեգորիաների',
    totalExpenses: 'Ընդհանուր ծախսեր',
    budgetRemaining: 'Մնացած բյուջե',

    // Core Finance & Net Worth
    netWorthTitle: 'Ընդհանուր կապիտալ (Net Worth)',
    netWorthDesc: 'Բոլոր արժույթների մնացորդների հանրագումարը փոխարժեքով',
    liveRatesTitle: 'Փոխարժեքներ',
    baseCurrency: 'Հիմնական արժույթ՝',

    // Quick Presets
    quickPresetsTitle: 'Արագ գործարքներ (1 հպումով)՝',
    presetCoffee: 'Սուրճ',
    presetLunch: 'Ճաշ',
    presetTaxi: 'Տաքսի',
    presetGroceries: 'Սնունդ',
    presetFuel: 'Բենզին',
    presetSalary: 'Աշխատավարձ',

    // Savings Goals
    addGoalTitle: 'Ստեղծել նոր նպատակ / Խնայատուփ',
    goalTitle: 'Նպատակ (օր.՝ Նոր MacBook, Հանգիստ)',
    targetAmount: 'Նպատակային գումար',
    initialAmount: 'Սկզբնական գումար',
    deadline: 'Վերջնաժամկետ',
    saveGoalBtn: 'Ստեղծել նպատակ',
    goalProgress: 'Հավաքված է',
    goalRemaining: 'Մնացել է հավաքել',
    depositBtn: 'Համալրել / Հանել',
    goalAchieved: 'Նպատակին հասել եք! 🎉',
    noGoals: 'Ակտիվ նպատակներ չկան: Ստեղծեք Ձեր առաջին խնայատուփը!',
    daysLeft: 'օր մնաց',
    daysOverdue: 'Ժամկետն անցել է',
    noDeadline: 'Անժամկետ',
    depositSuccess: 'Նպատակի մնացորդը թարմացվեց:',

    // Subscriptions
    addSubTitle: 'Ավելացնել պարբերական վճար / բաժանորդագրություն',
    subName: 'Ծառայության անվանում (օր.՝ Netflix, Spotify, Վարձ)',
    billingCycle: 'Պարբերականություն',
    cycleMonthly: 'Ամսական',
    cycleYearly: 'Տարեկան',
    cycleWeekly: 'Շաբաթական',
    nextBillingDate: 'Հաջորդ վճարում',
    saveSubBtn: 'Ավելացնել բաժանորդագրություն',
    monthlySubsTotal: 'Ընդհանուր ամսական բաժանորդագրություններ',
    activeSubsCount: 'Ակտիվ ծառայություններ',
    payNowBtn: 'Վճարել հիմա',
    paySubSuccess: 'Վճարումը կատարվեց: Ծախսը գրանցվեց:',
    subStatusActive: 'Ակտիվ',
    subStatusPaused: 'Դադարեցված',
    noSubs: 'Պարբերական վճարումներ չկան: Ավելացրեք առաջին ծառայությունը!',
    upcomingBadge: 'Մոտալուտ վճարում!',

    // Category Budgets
    addCatBudgetTitle: 'Սահմանել կատեգորիայի ամսական սահմանաչափ',
    catBudgetAmount: 'Ամսական սահմանաչափ',
    saveCatBudgetBtn: 'Պահպանել սահմանաչափը',
    spentSoFar: 'Ծախսվել է այս ամիս',
    limitExceeded: 'Սահմանաչափը գերազանցված է:',
    noCatBudgets: 'Կատեգորիաների սահմանաչափեր սահմանված չեն:'
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

  // Tab State: 'history' | 'analytics' | 'goals' | 'subscriptions' | 'budgets'
  const [activeTab, setActiveTab] = useState(() => {
    const path = location.pathname.replace('/', '');
    if (['analytics', 'goals', 'subscriptions', 'budgets'].includes(path)) return path;
    return 'history';
  });

  useEffect(() => {
    const path = location.pathname.replace('/', '');
    if (['analytics', 'goals', 'subscriptions', 'budgets'].includes(path)) {
      setActiveTab(path);
    } else if (['dashboard', 'history', 'transactions', ''].includes(path)) {
      setActiveTab('history');
    }
  }, [location.pathname]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'history') navigate('/dashboard', { replace: true });
    else navigate(`/${tab}`, { replace: true });
  };

  // Base Data States
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form States (New Transaction)
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('AMD');
  const [categoryId, setCategoryId] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [chartCurrency, setChartCurrency] = useState('AMD');
  const [monthlyBudget] = useState(250000);

  // Feature States: Goals, Subscriptions, Budgets, Exchange Rates
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({
    toAmd: { AMD: 1, USD: 388, EUR: 422, RUB: 4.25 },
    rates: { AMD: 1, USD: 1 / 388, EUR: 1 / 422, RUB: 1 / 4.25 }
  });
  const [netWorthBaseCurrency, setNetWorthBaseCurrency] = useState('AMD');

  // Goal Creation Form State
  const [newGoal, setNewGoal] = useState({
    title: '',
    target_amount: '',
    current_amount: '',
    currency: 'AMD',
    deadline: '',
    color: '#4f46e5'
  });

  // Goal Deposit Modal State
  const [depositModalGoal, setDepositModalGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');

  // Subscription Form State
  const [newSub, setNewSub] = useState({
    name: '',
    amount: '',
    currency: 'AMD',
    billing_cycle: 'monthly',
    next_payment_date: todayStr,
    category: 'Подписки'
  });

  // Category Budget Form State
  const [newCatBudget, setNewCatBudget] = useState({
    category_id: '',
    monthly_limit: '',
    currency: 'AMD'
  });

  // User State
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

  // Master Fetch
  const fetchData = async () => {
    try {
      setLoading(true);
      const [transRes, catRes, goalsRes, subsRes, budgetsRes, ratesRes] = await Promise.all([
        axios.get(`${API_URL}/transactions/${user.id}`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/savings-goals/${user.id}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/subscriptions/${user.id}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/category-budgets/${user.id}`).catch(() => ({ data: [] })),
        axios.get(`${API_URL}/exchange-rates`).catch(() => ({ data: null }))
      ]);

      setTransactions(transRes.data || []);
      setCategories(catRes.data || []);
      setSavingsGoals(goalsRes.data || []);
      setSubscriptions(subsRes.data || []);
      setCategoryBudgets(budgetsRes.data || []);
      if (ratesRes.data) setExchangeRates(ratesRes.data);

      const filtered = (catRes.data || []).filter(c => c.type === type);
      if (filtered.length > 0 && !categoryId) setCategoryId(filtered[0].id);
      if ((catRes.data || []).length > 0 && !newCatBudget.category_id) {
        const expenseCats = (catRes.data || []).filter(c => c.type === 'expense');
        if (expenseCats.length > 0) setNewCatBudget(prev => ({ ...prev, category_id: expenseCats[0].id }));
      }
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

  // 1-Click Preset Handler
  const applyPreset = (preset) => {
    setType(preset.type);
    setAmount(preset.amount);
    setDescription(preset.description[lang] || preset.description.en);
    setCurrency('AMD');
    
    // Find category
    const cat = categories.find(c => c.id === preset.categoryId);
    if (cat) {
      setCategoryId(cat.id);
    }
  };

  const presets = [
    { label: t.presetCoffee, icon: '☕', amount: '1200', type: 'expense', categoryId: 7, description: { ru: 'Кофе на вынос', en: 'Coffee', hy: 'Սուրճ' } },
    { label: t.presetLunch, icon: '🍔', amount: '2500', type: 'expense', categoryId: 7, description: { ru: 'Обед', en: 'Lunch', hy: 'Ճաշ' } },
    { label: t.presetTaxi, icon: '🚕', amount: '1500', type: 'expense', categoryId: 8, description: { ru: 'Такси', en: 'Taxi trip', hy: 'Տաքսի' } },
    { label: t.presetGroceries, icon: '🛒', amount: '5000', type: 'expense', categoryId: 6, description: { ru: 'Супермаркет', en: 'Groceries', hy: 'Սուպերմարկետ' } },
    { label: t.presetFuel, icon: '⛽', amount: '10000', type: 'expense', categoryId: 8, description: { ru: 'Заправка бензином', en: 'Fuel / Gas', hy: 'Բենզին' } },
    { label: t.presetSalary, icon: '💼', amount: '350000', type: 'income', categoryId: 1, description: { ru: 'Основная зарплата', en: 'Salary payment', hy: 'Աշխատավարձ' } }
  ];

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

  // Savings Goals Handlers
  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.target_amount || Number(newGoal.target_amount) <= 0) return;
    try {
      await axios.post(`${API_URL}/savings-goals`, {
        ...newGoal,
        user_id: user.id
      });
      setNewGoal({ title: '', target_amount: '', current_amount: '', currency: 'AMD', deadline: '', color: '#4f46e5' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDepositGoal = async (e) => {
    e.preventDefault();
    if (!depositModalGoal || !depositAmount) return;
    try {
      await axios.post(`${API_URL}/savings-goals/${depositModalGoal.id}/deposit`, {
        amount: Number(depositAmount)
      });
      setDepositModalGoal(null);
      setDepositAmount('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await axios.delete(`${API_URL}/savings-goals/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Subscriptions Handlers
  const handleCreateSubscription = async (e) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount || Number(newSub.amount) <= 0) return;
    try {
      await axios.post(`${API_URL}/subscriptions`, {
        ...newSub,
        user_id: user.id
      });
      setNewSub({ name: '', amount: '', currency: 'AMD', billing_cycle: 'monthly', next_payment_date: todayStr, category: 'Подписки' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleSub = async (id) => {
    try {
      await axios.put(`${API_URL}/subscriptions/${id}/toggle`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaySubscription = async (id) => {
    try {
      await axios.post(`${API_URL}/subscriptions/${id}/pay`);
      alert(t.paySubSuccess);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubscription = async (id) => {
    try {
      await axios.delete(`${API_URL}/subscriptions/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Category Budgets Handlers
  const handleSaveCategoryBudget = async (e) => {
    e.preventDefault();
    if (!newCatBudget.category_id || !newCatBudget.monthly_limit || Number(newCatBudget.monthly_limit) <= 0) return;
    try {
      await axios.post(`${API_URL}/category-budgets`, {
        ...newCatBudget,
        user_id: user.id
      });
      setNewCatBudget(prev => ({ ...prev, monthly_limit: '' }));
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategoryBudget = async (id) => {
    try {
      await axios.delete(`${API_URL}/category-budgets/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
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

  // Consolidated Net Worth Calculation (Core Finance)
  const toAmdRates = exchangeRates?.toAmd || { AMD: 1, USD: 388, EUR: 422, RUB: 4.25 };
  let totalNetWorthInAmd = 0;
  Object.keys(balances).forEach(curr => {
    const amountInCurr = balances[curr] || 0;
    const rateToAmd = toAmdRates[curr] || 1;
    totalNetWorthInAmd += amountInCurr * rateToAmd;
  });

  const convertedNetWorth = netWorthBaseCurrency === 'AMD' 
    ? totalNetWorthInAmd 
    : totalNetWorthInAmd / (toAmdRates[netWorthBaseCurrency] || 1);

  const currentMonthStr = new Date().toISOString().slice(0, 7);
  
  const totalMonthlyExpenses = transactions
    .filter(item => item.type === 'expense' && (item.currency || 'AMD') === 'AMD' && item.date && item.date.startsWith(currentMonthStr))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const totalMonthlyIncome = transactions
    .filter(item => item.type === 'income' && (item.currency || 'AMD') === 'AMD' && item.date && item.date.startsWith(currentMonthStr))
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const isBudgetExceeded = totalMonthlyExpenses > monthlyBudget;
  const budgetPercentage = Math.min(Math.round((totalMonthlyExpenses / monthlyBudget) * 100), 100);

  // Subscriptions total monthly calculation
  const totalMonthlySubsCost = subscriptions
    .filter(s => s.is_active)
    .reduce((sum, s) => {
      const amountNum = Number(s.amount) || 0;
      let monthlyEq = amountNum;
      if (s.billing_cycle === 'yearly') monthlyEq = amountNum / 12;
      else if (s.billing_cycle === 'weekly') monthlyEq = amountNum * 4.33;
      const rate = toAmdRates[s.currency || 'AMD'] || 1;
      return sum + (monthlyEq * rate);
    }, 0);

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
      <div style={{ textAlign: 'center', marginTop: '120px', fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>
        {t.loading}
      </div>
    );
  }

  return (
    <div className="app-content-container" style={{ maxWidth: '1240px', margin: '24px auto', padding: '0 20px 60px' }}>
      
      {/* 1. Header Profile & Title Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => setShowAvatarPicker(!showAvatarPicker)}>
            <img 
              src={user.avatar || AVATARS[0]} 
              alt="Avatar" 
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary)', boxShadow: 'var(--shadow-md)' }} 
            />
            <span style={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              backgroundColor: 'var(--primary)',
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
            <h1 style={{ fontSize: '1.5rem', color: 'var(--text-primary)', fontWeight: 800 }}>{t.dashboardTitle}</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--expense-bg)',
              color: 'var(--expense)',
              border: '1px solid var(--expense-border)',
              cursor: 'pointer',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
          >
            {t.logout}
          </button>
        </div>
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <div className="fintech-card" style={{ padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>{t.changeAvatar}:</span>
          <div style={{ display: 'flex', gap: '10px' }}>
            {AVATARS.map((url, idx) => (
              <img 
                key={idx} 
                src={url} 
                alt="option" 
                onClick={() => changeAvatar(url)}
                style={{
                  width: '42px',
                  height: '42px',
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

      {/* 2. CONSOLIDATED NET WORTH & LIVE RATES BANNER (Core Finance) */}
      <div className="fintech-card" style={{
        padding: '20px 24px',
        marginBottom: '24px',
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)',
        border: '1px solid var(--border-focus)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {t.netWorthTitle}
            </span>
            <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 700, backgroundColor: 'var(--income-bg)', color: 'var(--income)' }}>
              Live FX
            </span>
          </div>

          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '6px', letterSpacing: '-0.02em' }}>
            {formatMoney(convertedNetWorth)} <span style={{ fontSize: '1.1rem', color: 'var(--primary)', fontWeight: 700 }}>{netWorthBaseCurrency}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {t.netWorthDesc}
          </div>
        </div>

        {/* Currency Switcher & Rates Pill */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.baseCurrency}</span>
            <div style={{ display: 'flex', gap: '4px' }}>
              {['AMD', 'USD', 'EUR', 'RUB'].map(c => (
                <button
                  key={c}
                  onClick={() => setNetWorthBaseCurrency(c)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: netWorthBaseCurrency === c ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: netWorthBaseCurrency === c ? 'var(--primary)' : 'var(--bg-card)',
                    color: netWorthBaseCurrency === c ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            backgroundColor: 'var(--bg-card)',
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid var(--border)'
          }}>
            1 USD ≈ {toAmdRates.USD} ֏ | 1 EUR ≈ {toAmdRates.EUR} ֏ | 1 RUB ≈ {toAmdRates.RUB} ֏
          </div>
        </div>
      </div>

      {/* 3. TABS NAVIGATION BAR (Desktop & Mobile Scrollable) */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '4px',
        WebkitOverflowScrolling: 'touch'
      }}>
        <button
          type="button"
          onClick={() => handleTabSwitch('history')}
          className={`nav-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {t.historyTab} ({filteredTransactions.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('analytics')}
          className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          {t.analyticsTab}
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('goals')}
          className={`nav-tab-btn ${activeTab === 'goals' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
          </svg>
          {t.goalsTab} ({savingsGoals.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('subscriptions')}
          className={`nav-tab-btn ${activeTab === 'subscriptions' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          {t.subsTab} ({subscriptions.length})
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch('budgets')}
          className={`nav-tab-btn ${activeTab === 'budgets' ? 'active' : ''}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          {t.budgetsTab} ({categoryBudgets.length})
        </button>
      </div>

      {/* 4. FINANCIAL METRIC CARDS (Balances, Income, Expenses, Monthly Limit) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        {/* KPI 0: AMD Balance */}
        <div className="fintech-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.currentBalance} (AMD)</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.4">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
              {formatMoney(balances['AMD'] || 0)} <span style={{ fontSize: '0.95rem', color: 'var(--primary)', fontWeight: 700 }}>֏</span>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            {t.totalBalanceDesc}
          </div>
        </div>

        {/* KPI 1: Monthly Income */}
        <div className="fintech-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.incomeTotal}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--income-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--income)" strokeWidth="2.4">
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--income)', marginTop: '8px' }}>
              +{formatMoney(totalMonthlyIncome)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>֏</span>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            {t.forMonth} ({currentMonthStr})
          </div>
        </div>

        {/* KPI 2: Monthly Expenses */}
        <div className="fintech-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.expenseTotal}</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'var(--expense-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--expense)" strokeWidth="2.4">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--expense)', marginTop: '8px' }}>
              -{formatMoney(totalMonthlyExpenses)} <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>֏</span>
            </div>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '12px' }}>
            {t.forMonth} ({currentMonthStr})
          </div>
        </div>

        {/* KPI 3: Monthly Limit Progress */}
        <div className="fintech-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>{t.budgetLimit}</span>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: isBudgetExceeded ? 'var(--expense)' : 'var(--primary)' }}>
                {budgetPercentage}% {t.budgetUsed}
              </span>
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '8px' }}>
              {formatMoney(monthlyBudget)} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 700 }}>֏</span>
            </div>

            {/* Progress Bar */}
            <div className="progress-track" style={{ marginTop: '12px' }}>
              <div 
                className="progress-fill"
                style={{
                  width: `${budgetPercentage}%`,
                  backgroundColor: isBudgetExceeded ? 'var(--expense)' : budgetPercentage > 80 ? '#f59e0b' : 'var(--income)'
                }} 
              />
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', marginTop: '10px', color: isBudgetExceeded ? 'var(--expense)' : 'var(--text-muted)', fontWeight: isBudgetExceeded ? 700 : 500 }}>
            {isBudgetExceeded ? t.budgetExceeded : `${t.budgetRemaining}: ${formatMoney(Math.max(0, monthlyBudget - totalMonthlyExpenses))} AMD`}
          </div>
        </div>
      </div>

      {/* 5. ACTIVE TAB CONTENT */}

      {/* ================= TAB 1: HISTORY & TRANSACTIONS ================= */}
      {activeTab === 'history' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Quick Add Form on the Left */}
          <div className="fintech-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{t.quickAdd}</h2>
            
            {/* Quick 1-Click Presets */}
            <div style={{ marginBottom: '16px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
                {t.quickPresetsTitle}
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {presets.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="preset-chip"
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                    <span style={{ opacity: 0.7 }}>({p.amount}֏)</span>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={addTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Type Switcher */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                backgroundColor: 'var(--bg-card-subtle)',
                padding: '4px',
                borderRadius: '12px',
                gap: '6px'
              }}>
                <button
                  type="button"
                  onClick={() => handleTypeChange('income')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: type === 'income' ? 'var(--income)' : 'transparent',
                    color: type === 'income' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  {t.income}
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('expense')}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: type === 'expense' ? 'var(--expense)' : 'transparent',
                    color: type === 'expense' ? '#ffffff' : 'var(--text-secondary)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
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
                      borderColor: currency === curr ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: currency === curr ? 'var(--primary-light)' : 'var(--input-bg)',
                      color: currency === curr ? 'var(--primary)' : 'var(--text-secondary)',
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
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
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                    {t.category}
                  </label>
                  <select 
                    value={categoryId} 
                    onChange={(e) => setCategoryId(e.target.value)} 
                    className="fintech-select"
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
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
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
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
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
                backgroundColor: status === t.success ? 'var(--income-bg)' : 'var(--expense-bg)',
                color: status === t.success ? 'var(--income)' : 'var(--expense)'
              }}>
                {status}
              </div>
            )}
          </div>

          {/* Transaction History Feed on the Right */}
          <div className="fintech-card" style={{ padding: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '18px',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{t.history}</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Всего: {filteredTransactions.length}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button 
                  onClick={exportToCSV}
                  style={{
                    padding: '7px 12px',
                    backgroundColor: 'var(--bg-card-subtle)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.82rem',
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
                    padding: '7px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    minWidth: '130px'
                  }}
                />

                <select 
                  value={filterType} 
                  onChange={(e) => setFilterType(e.target.value)} 
                  style={{ padding: '7px 8px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                >
                  <option value="all">{t.allTypes}</option>
                  <option value="income">{t.income}</option>
                  <option value="expense">{t.expense}</option>
                </select>

                <input 
                  type="month" 
                  value={selectedMonth === 'all' ? '' : selectedMonth} 
                  onChange={(e) => setSelectedMonth(e.target.value || 'all')} 
                  style={{ padding: '6px 8px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', fontSize: '0.82rem' }}
                />
              </div>
            </div>

            {/* Transactions List */}
            {filteredTransactions.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px 0', fontSize: '0.92rem' }}>
                {t.noOps}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                        padding: '12px 14px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border)',
                        transition: 'transform 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          backgroundColor: t_item.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                          color: t_item.type === 'income' ? 'var(--income)' : 'var(--expense)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '0.9rem'
                        }}>
                          {catName ? catName.charAt(0).toUpperCase() : (t_item.type === 'income' ? 'I' : 'E')}
                        </div>

                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {t_item.description}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {catName && <span style={{ fontWeight: 600 }}>{catName}</span>}
                            <span>•</span>
                            <span>{formattedDate}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          textAlign: 'right',
                          fontWeight: 800,
                          fontSize: '0.95rem',
                          color: t_item.type === 'income' ? 'var(--income)' : 'var(--expense)'
                        }}>
                          {t_item.type === 'income' ? '+' : '-'}{formatMoney(t_item.amount)} {t_item.currency || 'AMD'}
                        </div>

                        <button 
                          onClick={() => deleteTransaction(t_item.id)}
                          title={t.delete}
                          style={{
                            padding: '5px 8px',
                            backgroundColor: 'transparent',
                            color: 'var(--text-muted)',
                            border: '1px solid var(--border)',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: 600
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 2: ANALYTICS & RECHARTS ================= */}
      {activeTab === 'analytics' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '24px',
          alignItems: 'start'
        }}>
          {/* Main Pie Chart Card */}
          <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{t.analytics}</h2>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {t.totalExpenses}: <strong style={{ color: 'var(--expense)' }}>{formatMoney(totalExpenseInCurrency)} {chartCurrency}</strong>
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{t.chartCurrency}</span>
                <select 
                  value={chartCurrency} 
                  onChange={(e) => setChartCurrency(e.target.value)}
                  style={{
                    padding: '5px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: '0.82rem',
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
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', minHeight: '300px' }}>
                {t.noAnalytics}
              </div>
            ) : (
              <div style={{ width: '100%', height: '320px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={110}
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
          <div className="fintech-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '18px' }}>
              {t.categoryBreakdown}
            </h2>

            {chartData.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontStyle: 'italic', minHeight: '300px' }}>
                {t.noAnalytics}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {chartData.map((cat, idx) => {
                  const color = CHART_COLORS[idx % CHART_COLORS.length];
                  return (
                    <div key={cat.name} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: color }} />
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{cat.name}</span>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                          {formatMoney(cat.value)} <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{chartCurrency}</span>
                          <span style={{ marginLeft: '6px', fontSize: '0.78rem', color: color, fontWeight: 800 }}>
                            ({cat.percent.toFixed(1)}%)
                          </span>
                        </div>
                      </div>

                      {/* Percentage Bar */}
                      <div className="progress-track" style={{ height: '6px' }}>
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${cat.percent}%`,
                            backgroundColor: color
                          }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: SAVINGS GOALS & PIGGY BANK ================= */}
      {activeTab === 'goals' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Create Goal Form */}
          <div className="fintech-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{t.addGoalTitle}</h2>
            <form onSubmit={handleCreateGoal} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.goalTitle}
                </label>
                <input
                  type="text"
                  required
                  placeholder="MacBook Pro M3, Dubai Trip..."
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.targetAmount}
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="500000"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, target_amount: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.initialAmount}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="50000"
                  value={newGoal.current_amount}
                  onChange={(e) => setNewGoal({ ...newGoal, current_amount: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.deadline}
                </label>
                <input
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.chartCurrency}
                </label>
                <select
                  value={newGoal.currency}
                  onChange={(e) => setNewGoal({ ...newGoal, currency: e.target.value })}
                  className="fintech-select"
                >
                  <option value="AMD">AMD (֏)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>

              <button type="submit" className="fintech-btn-primary" style={{ height: '46px' }}>
                {t.saveGoalBtn}
              </button>
            </form>
          </div>

          {/* Goals Cards Grid */}
          {savingsGoals.length === 0 ? (
            <div className="fintech-card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎯</div>
              {t.noGoals}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '20px'
            }}>
              {savingsGoals.map(goal => {
                const target = Number(goal.target_amount) || 1;
                const current = Number(goal.current_amount) || 0;
                const percent = Math.min(Math.round((current / target) * 100), 100);
                const isComplete = current >= target;

                let daysBadge = t.noDeadline;
                if (goal.deadline) {
                  const deadlineDate = new Date(goal.deadline);
                  const now = new Date();
                  const diffTime = deadlineDate - now;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) daysBadge = t.daysOverdue;
                  else daysBadge = `${diffDays} ${t.daysLeft}`;
                }

                return (
                  <div key={goal.id} className="fintech-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '42px',
                            height: '42px',
                            borderRadius: '12px',
                            backgroundColor: goal.color ? `${goal.color}20` : 'var(--primary-light)',
                            color: goal.color || 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.4rem'
                          }}>
                            🎯
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{goal.title}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {daysBadge}
                            </span>
                          </div>
                        </div>

                        {isComplete && (
                          <span className="status-pill success">
                            {t.goalAchieved}
                          </span>
                        )}
                      </div>

                      {/* Amounts */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '14px' }}>
                        <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatMoney(current)} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{goal.currency}</span>
                        </div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          из {formatMoney(target)} {goal.currency}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress-track" style={{ height: '9px', marginTop: '10px' }}>
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: isComplete ? 'var(--income)' : (goal.color || 'var(--primary)')
                          }} 
                        />
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '0.78rem', fontWeight: 800, color: goal.color || 'var(--primary)', marginTop: '4px' }}>
                        {percent}%
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '14px' }}>
                      <button
                        onClick={() => { setDepositModalGoal(goal); setDepositAmount(''); }}
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--bg-card-subtle)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {t.depositBtn}
                      </button>

                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--expense-bg)',
                          color: 'var(--expense)',
                          border: '1px solid var(--expense-border)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Deposit/Withdraw Modal */}
          {depositModalGoal && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: '20px'
            }}>
              <div className="fintech-card" style={{ width: '100%', maxWidth: '400px', padding: '24px' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-primary)' }}>
                  {depositModalGoal.title}
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                  Текущий баланс: {formatMoney(depositModalGoal.current_amount)} {depositModalGoal.currency}
                </p>

                <form onSubmit={handleDepositGoal} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Сумма (+ пополнить, - снять):
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      autoFocus
                      placeholder="Например: 25000 или -5000"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="fintech-input"
                      style={{ fontWeight: 700, fontSize: '1.1rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setDepositModalGoal(null)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        backgroundColor: 'var(--bg-card-subtle)',
                        color: 'var(--text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Отмена
                    </button>
                    <button type="submit" className="fintech-btn-primary" style={{ flex: 1 }}>
                      Применить
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: SUBSCRIPTION TRACKER ================= */}
      {activeTab === 'subscriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Subscriptions Overview Card */}
          <div className="fintech-card" style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                {t.monthlySubsTotal}
              </span>
              <div style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
                ~{formatMoney(Math.round(totalMonthlySubsCost))} <span style={{ fontSize: '1rem', color: '#ec4899', fontWeight: 700 }}>AMD / месяц</span>
              </div>
            </div>

            <div className="status-pill neutral" style={{ fontSize: '0.85rem', padding: '8px 14px' }}>
              {subscriptions.filter(s => s.is_active).length} {t.activeSubsCount}
            </div>
          </div>

          {/* Add Subscription Form */}
          <div className="fintech-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{t.addSubTitle}</h2>
            <form onSubmit={handleCreateSubscription} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.subName}
                </label>
                <input
                  type="text"
                  required
                  placeholder="Netflix, Spotify, Yandex Plus..."
                  value={newSub.name}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.amount}
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  placeholder="3500"
                  value={newSub.amount}
                  onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.chartCurrency}
                </label>
                <select
                  value={newSub.currency}
                  onChange={(e) => setNewSub({ ...newSub, currency: e.target.value })}
                  className="fintech-select"
                >
                  <option value="AMD">AMD (֏)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="RUB">RUB (₽)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.billingCycle}
                </label>
                <select
                  value={newSub.billing_cycle}
                  onChange={(e) => setNewSub({ ...newSub, billing_cycle: e.target.value })}
                  className="fintech-select"
                >
                  <option value="monthly">{t.cycleMonthly}</option>
                  <option value="yearly">{t.cycleYearly}</option>
                  <option value="weekly">{t.cycleWeekly}</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.nextBillingDate}
                </label>
                <input
                  type="date"
                  required
                  value={newSub.next_payment_date}
                  onChange={(e) => setNewSub({ ...newSub, next_payment_date: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <button type="submit" className="fintech-btn-primary" style={{ height: '46px' }}>
                {t.saveSubBtn}
              </button>
            </form>
          </div>

          {/* Subscriptions List */}
          {subscriptions.length === 0 ? (
            <div className="fintech-card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔄</div>
              {t.noSubs}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {subscriptions.map(sub => {
                const nextDate = sub.next_payment_date ? new Date(sub.next_payment_date) : null;
                const formattedNextDate = nextDate ? nextDate.toLocaleDateString() : '';
                const isDueSoon = nextDate ? ((nextDate - new Date()) / (1000 * 60 * 60 * 24)) <= 3 : false;

                return (
                  <div key={sub.id} className="fintech-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: '#ec489920',
                            color: '#ec4899',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem'
                          }}>
                            {sub.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{sub.name}</h3>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {sub.billing_cycle === 'yearly' ? t.cycleYearly : sub.billing_cycle === 'weekly' ? t.cycleWeekly : t.cycleMonthly}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {isDueSoon && sub.is_active && (
                            <span className="status-pill warning" style={{ fontSize: '0.7rem' }}>
                              {t.upcomingBadge}
                            </span>
                          )}
                          <span 
                            onClick={() => handleToggleSub(sub.id)}
                            className={`status-pill ${sub.is_active ? 'success' : 'neutral'}`}
                            style={{ cursor: 'pointer', fontSize: '0.7rem' }}
                          >
                            {sub.is_active ? t.subStatusActive : t.subStatusPaused}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatMoney(sub.amount)} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{sub.currency}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {t.nextBillingDate}: <strong style={{ color: isDueSoon ? '#f59e0b' : 'var(--text-primary)' }}>{formattedNextDate}</strong>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                      <button
                        onClick={() => handlePaySubscription(sub.id)}
                        className="fintech-btn-primary"
                        style={{ flex: 1, padding: '7px 12px', fontSize: '0.82rem' }}
                      >
                        ✓ {t.payNowBtn}
                      </button>

                      <button
                        onClick={() => handleDeleteSubscription(sub.id)}
                        style={{
                          padding: '7px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--expense-bg)',
                          color: 'var(--expense)',
                          border: '1px solid var(--expense-border)',
                          fontWeight: 700,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 5: CATEGORY BUDGETS ================= */}
      {activeTab === 'budgets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Add Category Budget Form */}
          <div className="fintech-card" style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '16px', color: 'var(--text-primary)' }}>{t.addCatBudgetTitle}</h2>
            <form onSubmit={handleSaveCategoryBudget} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.category}
                </label>
                <select
                  value={newCatBudget.category_id}
                  onChange={(e) => setNewCatBudget({ ...newCatBudget, category_id: e.target.value })}
                  className="fintech-select"
                >
                  {categories.filter(c => c.type === 'expense').map(c => (
                    <option key={c.id} value={c.id}>{getLocalizedCategoryName(c)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '6px', display: 'block' }}>
                  {t.catBudgetAmount} (AMD)
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="40000"
                  value={newCatBudget.monthly_limit}
                  onChange={(e) => setNewCatBudget({ ...newCatBudget, monthly_limit: e.target.value })}
                  className="fintech-input"
                />
              </div>

              <button type="submit" className="fintech-btn-primary" style={{ height: '46px' }}>
                {t.saveCatBudgetBtn}
              </button>
            </form>
          </div>

          {/* Category Budgets Cards */}
          {categoryBudgets.length === 0 ? (
            <div className="fintech-card" style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📊</div>
              {t.noCatBudgets}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {categoryBudgets.map(cb => {
                const limit = Number(cb.monthly_limit) || 1;
                
                // Calculate how much was spent on this category this month
                const spentThisMonth = transactions
                  .filter(t_item => 
                    t_item.type === 'expense' && 
                    t_item.category_id === cb.category_id && 
                    (t_item.currency || 'AMD') === (cb.currency || 'AMD') &&
                    t_item.date && t_item.date.startsWith(currentMonthStr)
                  )
                  .reduce((sum, t_item) => sum + Number(t_item.amount), 0);

                const percent = Math.min(Math.round((spentThisMonth / limit) * 100), 100);
                const isOver = spentThisMonth > limit;

                const matchedCat = categories.find(c => c.id === cb.category_id);
                const catName = matchedCat ? getLocalizedCategoryName(matchedCat) : cb.category_name;

                return (
                  <div key={cb.id} className="fintech-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{catName}</h3>
                        {isOver ? (
                          <span className="status-pill danger">{t.limitExceeded}</span>
                        ) : (
                          <span className="status-pill success">{percent}%</span>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '12px' }}>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: isOver ? 'var(--expense)' : 'var(--text-primary)' }}>
                          {formatMoney(spentThisMonth)} <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{cb.currency || 'AMD'}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          Лимит: {formatMoney(limit)} {cb.currency || 'AMD'}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="progress-track" style={{ height: '8px', marginTop: '10px' }}>
                        <div 
                          className="progress-fill"
                          style={{
                            width: `${percent}%`,
                            backgroundColor: isOver ? 'var(--expense)' : percent > 80 ? '#f59e0b' : 'var(--income)'
                          }} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {isOver ? `Перерасход: +${formatMoney(spentThisMonth - limit)}` : `Осталось: ${formatMoney(limit - spentThisMonth)}`}
                      </span>

                      <button
                        onClick={() => handleDeleteCategoryBudget(cb.id)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '6px',
                          backgroundColor: 'transparent',
                          color: 'var(--text-muted)',
                          border: '1px solid var(--border)',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
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
      )}

    </div>
  );
}

export default Dashboard;