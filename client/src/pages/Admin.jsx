import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

const adminTranslations = {
  ru: {
    title: 'Панель администратора',
    subtitle: 'Управление платформой, мониторинг и глобальная статистика',
    tabAnalytics: '📊 Аналитика платформы',
    tabUsers: '👥 Пользователи',
    tabCategories: '🏷️ Управление категориями',
    tabLogs: '🛡️ Мониторинг и логи',
    refresh: 'Обновить данные',
    backToDashboard: '← К моим финансам',
    
    // Метрики
    totalUsers: 'Всего пользователей',
    activeUsers: 'Активных пользователей',
    blockedUsers: 'Заблокировано',
    totalTransactions: 'Всего транзакций',
    turnover: 'Общий денежный оборот',
    
    // Пользователи
    searchUsers: 'Поиск пользователя по имени или email...',
    filterAll: 'Все',
    filterActive: 'Активные',
    filterBlocked: 'Заблокированные',
    filterAdmin: 'Администраторы',
    userColAvatar: 'Аватар',
    userColName: 'Пользователь',
    userColEmail: 'Email',
    userColRole: 'Роль',
    userColStatus: 'Статус',
    userColRegDate: 'Дата регистрации',
    userColOps: 'Операций',
    userColActions: 'Действия',
    statusActive: 'Активен',
    statusBlocked: 'Заблокирован',
    btnBlock: 'Заблокировать',
    btnUnblock: 'Разблокировать',
    btnMakeAdmin: 'Сделать админом',
    btnMakeUser: 'Снять админа',
    btnDelete: 'Удалить',
    confirmDeleteUser: 'Вы действительно хотите безвозвратно удалить этого пользователя и все его транзакции?',
    
    // Категории
    addCategoryTitle: 'Добавить новую глобальную категорию',
    catNamePlaceholder: 'Название категории (напр., Криптовалюта, Инвестиции)',
    catTypeIncome: 'Доход',
    catTypeExpense: 'Расход',
    btnAddCategory: 'Добавить категорию',
    editCategory: 'Редактировать',
    deleteCategory: 'Удалить',
    confirmDeleteCat: 'Удалить эту категорию?',
    allCategories: 'Глобальные категории системы',
    
    // Логи
    logAction: 'Действие',
    logUser: 'Пользователь / Источник',
    logDetails: 'Описание события',
    logStatus: 'Статус',
    logIp: 'IP адрес',
    logDate: 'Время',
    btnClearLogs: 'Очистить журнал логов',
    noLogs: 'Логи пока отсутствуют',
    
    // Графики
    chartTurnoverTitle: 'Оборот по валютам',
    chartCategoriesTitle: 'Топ категорий по числу операций',
    chartTypesTitle: 'Соотношение доходов и расходов',
    loading: 'Загрузка данных панели управления...',
    accessDenied: 'Доступ ограничен. Только администраторы могут управлять этой панелью.'
  },
  en: {
    title: 'Admin Control Center',
    subtitle: 'Platform management, security monitoring, and global metrics',
    tabAnalytics: '📊 Platform Analytics',
    tabUsers: '👥 User Management',
    tabCategories: '🏷️ Categories',
    tabLogs: '🛡️ Security Logs',
    refresh: 'Refresh Data',
    backToDashboard: '← Back to Finances',
    
    totalUsers: 'Total Users',
    activeUsers: 'Active Users',
    blockedUsers: 'Blocked Users',
    totalTransactions: 'Total Transactions',
    turnover: 'Total Platform Turnover',
    
    searchUsers: 'Search users by name or email...',
    filterAll: 'All',
    filterActive: 'Active',
    filterBlocked: 'Blocked',
    filterAdmin: 'Admins',
    userColAvatar: 'Avatar',
    userColName: 'User',
    userColEmail: 'Email',
    userColRole: 'Role',
    userColStatus: 'Status',
    userColRegDate: 'Registered',
    userColOps: 'Operations',
    userColActions: 'Actions',
    statusActive: 'Active',
    statusBlocked: 'Blocked',
    btnBlock: 'Block Account',
    btnUnblock: 'Unblock',
    btnMakeAdmin: 'Promote to Admin',
    btnMakeUser: 'Demote to User',
    btnDelete: 'Delete',
    confirmDeleteUser: 'Are you sure you want to permanently delete this user and all their transactions?',
    
    addCategoryTitle: 'Add New Global Category',
    catNamePlaceholder: 'Category name (e.g., Crypto, Stocks, Rent)',
    catTypeIncome: 'Income',
    catTypeExpense: 'Expense',
    btnAddCategory: 'Add Category',
    editCategory: 'Edit',
    deleteCategory: 'Delete',
    confirmDeleteCat: 'Delete this category?',
    allCategories: 'Global Platform Categories',
    
    logAction: 'Action',
    logUser: 'User / Source',
    logDetails: 'Event Details',
    logStatus: 'Status',
    logIp: 'IP Address',
    logDate: 'Timestamp',
    btnClearLogs: 'Clear Audit Logs',
    noLogs: 'No logs recorded yet',
    
    chartTurnoverTitle: 'Turnover by Currency',
    chartCategoriesTitle: 'Top Categories by Operation Count',
    chartTypesTitle: 'Income vs Expense Breakdown',
    loading: 'Loading admin dashboard...',
    accessDenied: 'Restricted Access. Only administrators can view this control panel.'
  },
  hy: {
    title: 'Ադմինիստրատորի Վահանակ',
    subtitle: 'Համակարգի կառավարում, անվտանգության մոնիտորինգ և գլոբալ վիճակագրություն',
    tabAnalytics: '📊 Համակարգի Վերլուծություն',
    tabUsers: '👥 Օգտատերեր',
    tabCategories: '🏷️ Կատեգորիաներ',
    tabLogs: '🛡️ Անվտանգության Լոգեր',
    refresh: 'Թարմացնել',
    backToDashboard: '← Իմ ֆինանսները',
    
    totalUsers: 'Ընդհանուր Օգտատերեր',
    activeUsers: 'Ակտիվ Օգտատերեր',
    blockedUsers: 'Արգելափակված',
    totalTransactions: 'Ընդհանուր Գործարքներ',
    turnover: 'Դրամական Շրջանառություն',
    
    searchUsers: 'Որոնել ըստ անվան կամ էլ. հասցեի...',
    filterAll: 'Բոլորը',
    filterActive: 'Ակտիվ',
    filterBlocked: 'Արգելափակված',
    filterAdmin: 'Ադմիններ',
    userColAvatar: 'Ավատար',
    userColName: 'Անուն',
    userColEmail: 'Էլ. հասցե',
    userColRole: 'Դեր',
    userColStatus: 'Կարգավիճակ',
    userColRegDate: 'Գրանցման Ամսաթիվ',
    userColOps: 'Գործարքներ',
    userColActions: 'Գործողություններ',
    statusActive: 'Ակտիվ',
    statusBlocked: 'Արգելափակված',
    btnBlock: 'Արգելափակել',
    btnUnblock: 'Ապաարգելափակել',
    btnMakeAdmin: 'Դարձնել Ադմին',
    btnMakeUser: 'Դարձնել Օգտատեր',
    btnDelete: 'Ջնջել',
    confirmDeleteUser: 'Վստա՞հ եք, որ ցանկանում եք ջնջել այս օգտատիրոջը և նրա բոլոր գործարքները:',
    
    addCategoryTitle: 'Ավելացնել Նոր Գլոբալ Կատեգորիա',
    catNamePlaceholder: 'Կատեգորիայի անունը (օր.՝ Կրիպտոարժույթ, Բաժնետոմսեր)',
    catTypeIncome: 'Եկամուտ',
    catTypeExpense: 'Ծախս',
    btnAddCategory: 'Ավելացնել',
    editCategory: 'Խմբագրել',
    deleteCategory: 'Ջնջել',
    confirmDeleteCat: 'Ջնջե՞լ այս կատեգորիան:',
    allCategories: 'Համակարգի Գլոբալ Կատեգորիաներ',
    
    logAction: 'Գործողություն',
    logUser: 'Օգտատեր',
    logDetails: 'Մանրամասներ',
    logStatus: 'Կարգավիճակ',
    logIp: 'IP հասցե',
    logDate: 'Ժամանակ',
    btnClearLogs: 'Մաքրել Լոգերը',
    noLogs: 'Լոգեր դեռ չկան',
    
    chartTurnoverTitle: 'Շրջանառությունն ըստ Արժույթների',
    chartCategoriesTitle: 'Ամենաշատ Օգտագործված Կատեգորիաները',
    chartTypesTitle: 'Եկամուտների և Ծախսերի Հարաբերակցություն',
    loading: 'Տվյալները բեռնվում են...',
    accessDenied: 'Մուտքը սահմանափակված է: Միայն ադմինիստրատորները կարող են մուտք գործել:'
  }
};

const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b'];

function Admin({ lang }) {
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'users' | 'categories' | 'logs'
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Фильтрация пользователей
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState('all'); // 'all' | 'active' | 'blocked' | 'admin'

  // Добавление новой категории
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState('expense');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');

  // Текущий пользователь
  const currentUser = JSON.parse(localStorage.getItem('user')) || {};
  const t = adminTranslations[lang] || adminTranslations.ru;

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, catRes, logsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`),
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/categories`),
        axios.get(`${API_URL}/admin/logs`)
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setCategories(catRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Действия над пользователями
  const handleToggleBlock = async (userId) => {
    try {
      await axios.put(`${API_URL}/admin/users/${userId}/block`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error toggling user block state');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await axios.put(`${API_URL}/admin/users/${userId}/role`, { role: newRole });
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error changing role');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm(t.confirmDeleteUser)) return;
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting user');
    }
  };

  // Действия над категориями
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await axios.post(`${API_URL}/admin/categories`, {
        name: newCatName.trim(),
        type: newCatType
      });
      setNewCatName('');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error adding category');
    }
  };

  const handleUpdateCategory = async (id, type) => {
    if (!editingCatName.trim()) return;
    try {
      await axios.put(`${API_URL}/admin/categories/${id}`, {
        name: editingCatName.trim(),
        type
      });
      setEditingCatId(null);
      setEditingCatName('');
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error updating category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm(t.confirmDeleteCat)) return;
    try {
      await axios.delete(`${API_URL}/admin/categories/${id}`);
      fetchAllData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error deleting category');
    }
  };

  // Очистка логов
  const handleClearLogs = async () => {
    if (!window.confirm('Очистить все логи аудита?')) return;
    try {
      await axios.delete(`${API_URL}/admin/logs`);
      fetchAllData();
    } catch (err) {
      alert('Error clearing logs');
    }
  };

  // Фильтрация пользователей
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(userSearch.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(userSearch.toLowerCase()));
    
    if (userFilter === 'active') return matchesSearch && !u.is_blocked;
    if (userFilter === 'blocked') return matchesSearch && u.is_blocked;
    if (userFilter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  const formatMoney = (val) => Number(val || 0).toLocaleString('ru-RU');

  if (loading && !stats) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#475569', fontSize: '1.2rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>⚡</div>
        {t.loading}
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      
      {/* Шапка админки */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '24px 30px',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ADMIN PANEL
            </span>
            <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>v2.0 Scalable Multi-User Edition</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>{t.title}</h1>
          <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '0.95rem' }}>{t.subtitle}</p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={fetchAllData}
            style={{
              background: '#334155',
              border: 'none',
              color: '#f8fafc',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 {t.refresh}
          </button>
          <Link
            to="/dashboard"
            style={{
              background: '#3b82f6',
              color: '#fff',
              textDecoration: 'none',
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem'
            }}
          >
            {t.backToDashboard}
          </Link>
        </div>
      </div>

      {/* Быстрые карточки показателей (KPI) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{t.totalUsers}</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {stats?.users?.total_users || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>
            ● {Number(stats?.users?.total_users || 0) - Number(stats?.users?.blocked_users || 0)} {t.statusActive}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{t.blockedUsers}</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: stats?.users?.blocked_users > 0 ? '#ef4444' : '#64748b', marginTop: '4px' }}>
            {stats?.users?.blocked_users || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            Безопасность системы
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>{t.totalTransactions}</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#3b82f6', marginTop: '4px' }}>
            {stats?.transactions?.total_transactions || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            Активных пользователей: {stats?.transactions?.active_transacting_users || 0}
          </div>
        </div>

        <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Категорий в системе</span>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#8b5cf6', marginTop: '4px' }}>
            {categories.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            Глобальная классификация
          </div>
        </div>
      </div>

      {/* Навигационные табы панели */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        {[
          { id: 'analytics', label: t.tabAnalytics },
          { id: 'users', label: `${t.tabUsers} (${users.length})` },
          { id: 'categories', label: `${t.tabCategories} (${categories.length})` },
          { id: 'logs', label: `${t.tabLogs} (${logs.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: 'none',
              fontWeight: activeTab === tab.id ? 700 : 500,
              fontSize: '0.95rem',
              color: activeTab === tab.id ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '3px solid #2563eb' : '3px solid transparent',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ТАБ 1: ПЛАТФОРМЕННАЯ АНАЛИТИКА */}
      {activeTab === 'analytics' && (
        <div>
          {/* Оборот по валютам */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#0f172a' }}>💰 {t.chartTurnoverTitle}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              {stats?.currencies?.map((curr) => (
                <div key={curr.currency} style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', borderLeft: '4px solid #3b82f6' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155' }}>{curr.currency}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>
                    {formatMoney(curr.total_turnover)} {curr.currency}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    🟢 Доход: {formatMoney(curr.income_total)} | 🔴 Расход: {formatMoney(curr.expense_total)}
                  </div>
                </div>
              ))}
              {(!stats?.currencies || stats.currencies.length === 0) && (
                <div style={{ color: '#64748b', fontStyle: 'italic' }}>Нет операций в системе</div>
              )}
            </div>

            {/* График оборота по валютам */}
            {stats?.currencies?.length > 0 && (
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.currencies}>
                    <XAxis dataKey="currency" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatMoney(value)} />
                    <Bar dataKey="income_total" name="Доход (Income)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense_total" name="Расход (Expense)" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Два графика рядом: Категории и Доходы/Расходы */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            {/* Топ категорий */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>🏆 {t.chartCategoriesTitle}</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.topCategories || []} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" name="Операций" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Соотношение Доход / Расход */}
            <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#0f172a' }}>⚖️ {t.chartTypesTitle}</h3>
              <div style={{ height: '280px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.types?.map(t_item => ({
                        name: t_item.type === 'income' ? 'Доходы' : 'Расходы',
                        value: Number(t_item.count)
                      })) || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label
                    >
                      <Cell fill="#10b981" />
                      <Cell fill="#ef4444" />
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ТАБ 2: УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ */}
      {activeTab === 'users' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          {/* Поиск и фильтры */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: '20px' }}>
            <input 
              type="text"
              placeholder={t.searchUsers}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              style={{
                flex: '1',
                minWidth: '260px',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.9rem'
              }}
            />

            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { id: 'all', label: t.filterAll },
                { id: 'active', label: t.filterActive },
                { id: 'blocked', label: t.filterBlocked },
                { id: 'admin', label: t.filterAdmin }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => setUserFilter(f.id)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: userFilter === f.id ? '#0f172a' : '#f8fafc',
                    color: userFilter === f.id ? '#fff' : '#334155',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem'
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Таблица пользователей */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 14px' }}>ID</th>
                  <th style={{ padding: '12px 14px' }}>{t.userColName}</th>
                  <th style={{ padding: '12px 14px' }}>{t.userColEmail}</th>
                  <th style={{ padding: '12px 14px' }}>{t.userColRole}</th>
                  <th style={{ padding: '12px 14px' }}>{t.userColStatus}</th>
                  <th style={{ padding: '12px 14px' }}>{t.userColOps}</th>
                  <th style={{ padding: '12px 14px' }}>{t.userColRegDate}</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>{t.userColActions}</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9', background: u.is_blocked ? '#fef2f2' : '#fff' }}>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600 }}>#{u.id}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img 
                          src={u.avatar || 'https://cdn-icons-png.flaticon.com/512/847/847969.png'} 
                          alt="avatar" 
                          style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>{u.email}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: u.role === 'admin' ? '#ede9fe' : '#f1f5f9',
                        color: u.role === 'admin' ? '#7c3aed' : '#475569'
                      }}>
                        {u.role === 'admin' ? '👑 ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: u.is_blocked ? '#fee2e2' : '#dcfce7',
                        color: u.is_blocked ? '#dc2626' : '#16a34a'
                      }}>
                        {u.is_blocked ? `⛔ ${t.statusBlocked}` : `✓ ${t.statusActive}`}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>{u.transaction_count}</span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '0.85rem' }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        {/* Блокировка */}
                        <button
                          onClick={() => handleToggleBlock(u.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: u.is_blocked ? '#10b981' : '#f59e0b',
                            color: '#fff'
                          }}
                        >
                          {u.is_blocked ? t.btnUnblock : t.btnBlock}
                        </button>

                        {/* Смена роли */}
                        <button
                          onClick={() => handleToggleRole(u.id, u.role)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: '#fff',
                            color: '#334155'
                          }}
                        >
                          {u.role === 'admin' ? t.btnMakeUser : t.btnMakeAdmin}
                        </button>

                        {/* Удаление */}
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: 'none',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            background: '#ef4444',
                            color: '#fff'
                          }}
                        >
                          {t.btnDelete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                      Пользователи не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ТАБ 3: ГЛОБАЛЬНОЕ УПРАВЛЕНИЕ КАТЕГОРИЯМИ */}
      {activeTab === 'categories' && (
        <div>
          {/* Форма добавления */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#0f172a' }}>➕ {t.addCategoryTitle}</h3>
            <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <input 
                type="text"
                placeholder={t.catNamePlaceholder}
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                style={{
                  flex: '2',
                  minWidth: '240px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem'
                }}
              />
              <select
                value={newCatType}
                onChange={(e) => setNewCatType(e.target.value)}
                style={{
                  flex: '1',
                  minWidth: '140px',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                <option value="expense">🔴 {t.catTypeExpense}</option>
                <option value="income">🟢 {t.catTypeIncome}</option>
              </select>
              <button
                type="submit"
                style={{
                  background: '#2563eb',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  cursor: 'pointer'
                }}
              >
                {t.btnAddCategory}
              </button>
            </form>
          </div>

          {/* Список существующих категорий */}
          <div style={{ background: '#fff', padding: '24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', color: '#0f172a' }}>📋 {t.allCategories} ({categories.length})</h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px'
            }}>
              {categories.map((cat) => (
                <div 
                  key={cat.id}
                  style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    {editingCatId === cat.id ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input 
                          type="text" 
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}
                        />
                        <button onClick={() => handleUpdateCategory(cat.id, cat.type)} style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>✓</button>
                        <button onClick={() => setEditingCatId(null)} style={{ background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>✕</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{cat.name}</div>
                        <span style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          color: cat.type === 'income' ? '#16a34a' : '#dc2626'
                        }}>
                          {cat.type === 'income' ? '🟢 ДОХОД' : '🔴 РАСХОД'}
                        </span>
                      </>
                    )}
                  </div>

                  {editingCatId !== cat.id && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => { setEditingCatId(cat.id); setEditingCatName(cat.name); }}
                        style={{
                          background: '#e2e8f0',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        style={{
                          background: '#fee2e2',
                          color: '#dc2626',
                          border: 'none',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ТАБ 4: МОНИТОРИНГ И ЛОГИ БЕЗОПАСНОСТИ */}
      {activeTab === 'logs' && (
        <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>🛡️ Журнал системных событий и аудита</h3>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
                Фиксация всех ключевых действий: регистрации, логины, операции с финансами и администрирование
              </p>
            </div>
            <button
              onClick={handleClearLogs}
              style={{
                background: '#fee2e2',
                color: '#dc2626',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem'
              }}
            >
              🗑️ {t.btnClearLogs}
            </button>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '10px 12px' }}>ID</th>
                  <th style={{ padding: '10px 12px' }}>{t.logAction}</th>
                  <th style={{ padding: '10px 12px' }}>{t.logStatus}</th>
                  <th style={{ padding: '10px 12px' }}>{t.logUser}</th>
                  <th style={{ padding: '10px 12px' }}>{t.logDetails}</th>
                  <th style={{ padding: '10px 12px' }}>{t.logIp}</th>
                  <th style={{ padding: '10px 12px' }}>{t.logDate}</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  let badgeBg = '#dcfce7';
                  let badgeColor = '#16a34a';
                  if (log.status === 'WARNING') { badgeBg = '#fef3c7'; badgeColor = '#d97706'; }
                  if (['ERROR', 'DENIED', 'DANGER'].includes(log.status)) { badgeBg = '#fee2e2'; badgeColor = '#dc2626'; }
                  if (log.status === 'INFO') { badgeBg = '#e0f2fe'; badgeColor = '#0284c7'; }

                  return (
                    <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '10px 12px', color: '#64748b' }}>#{log.id}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: '#0f172a' }}>
                        <code>{log.action}</code>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          background: badgeBg,
                          color: badgeColor
                        }}>
                          {log.status || 'OK'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: '#334155' }}>{log.user_email || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#475569' }}>{log.details || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', fontFamily: 'monospace' }}>{log.ip_address || '—'}</td>
                      <td style={{ padding: '10px 12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                        {log.created_at ? new Date(log.created_at).toLocaleString() : '—'}
                      </td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan="7" style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                      {t.noLogs}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

export default Admin;
