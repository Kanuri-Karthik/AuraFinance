import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Users, Activity, Database, MoreVertical, Trash2, Ban, Mail, CheckCircle2, RotateCcw, Lock, ChevronRight, Eye, ArrowLeft, Calendar, User, MapPin, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { AuthContext, useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { FinanceContext, useFinance } from '../context/FinanceContext';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import Dashboard from './Dashboard';

const Admin = () => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();
  const { transactions } = useFinance();
  
  const [activeTab, setActiveTab] = useState('users');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passphrase, setPassphrase] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);

  // Lock logic
  useEffect(() => {
    if (sessionStorage.getItem('admin_auth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (passphrase === 'admin123') {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      addNotification('Access Granted', 'Welcome to the master control panel.', 'success');
    } else {
      addNotification('Access Denied', 'Invalid master key.', 'error');
      setPassphrase('');
    }
  };

  const [users, setUsers] = useState([]);
  const [dbStatus, setDbStatus] = useState('Active');
  const [investigatedFinance, setInvestigatedFinance] = useState(null);
  const [adminStats, setAdminStats] = useState({ totalUsers: 0, totalTransactions: 0, income: 0, expenses: 0, flags: 0, notifications: [] });
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sysConfig, setSysConfig] = useState({ maintenanceMode: false, categories: [] });

  const analyticsData = [
    { name: 'Jan', users: 120, volume: 45000 },
    { name: 'Feb', users: 150, volume: 52000 },
    { name: 'Mar', users: 200, volume: 61000 },
    { name: 'Apr', users: 280, volume: 84000 },
    { name: 'May', users: 310, volume: 92000 },
    { name: 'Jun', users: adminStats?.totalUsers || 400, volume: ((adminStats?.income || 0) + (adminStats?.expenses || 0)) || 110000 },
  ];

  const BACKEND_BASE = `http://${window.location.hostname}:5000/api`;

  // Fetch real stats & insights
  useEffect(() => {
    if (isAuthenticated) {
      const fetchStats = () => {
        fetch(`${BACKEND_BASE}/admin/stats`)
          .then(res => res.json())
          .then(data => setAdminStats(data))
          .catch(() => {});
      };
      fetchStats();
      const interval = setInterval(fetchStats, 30000); // Live update every 30s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, BACKEND_BASE]);

  // Fetch sys config
  useEffect(() => {
    if (isAuthenticated) {
      fetch(`${BACKEND_BASE}/admin/config`)
        .then(res => res.json())
        .then(data => setSysConfig(data))
        .catch(() => {});
    }
  }, [isAuthenticated, BACKEND_BASE]);

  // Fetch real users from DB with search/filter
  useEffect(() => {
    if (isAuthenticated) {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);

      fetch(`${BACKEND_BASE}/admin/users?${params.toString()}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUsers(data);
            setDbStatus('Active');
          }
        })
        .catch(err => {
          console.error("Admin fetch error:", err);
          setDbStatus('Active');
          setUsers([]);
        });
    }
  }, [isAuthenticated, currentUser, BACKEND_BASE, searchQuery, statusFilter]);

  // Fetch audit logs
  useEffect(() => {
    if (isAuthenticated && activeTab === 'system') {
      fetch(`${BACKEND_BASE}/admin/logs`)
        .then(res => res.json())
        .then(data => setAuditLogs(data))
        .catch(() => {});
    }
  }, [isAuthenticated, activeTab, BACKEND_BASE]);

  // Fetch specific user data for investigation
  useEffect(() => {
    if (selectedUser) {
      fetch(`${BACKEND_BASE}/finances/${selectedUser.id}`)
        .then(res => res.json())
        .then(data => {
          if (data) setInvestigatedFinance(data);
          else setInvestigatedFinance(null);
        })
        .catch(() => setInvestigatedFinance(null));
    }
  }, [selectedUser, BACKEND_BASE]);

  const toggleMaintenance = async () => {
    const newMode = !sysConfig.maintenanceMode;
    try {
      const res = await fetch(`${BACKEND_BASE}/admin/config/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUid: currentUser?.uid || 'admin', mode: newMode })
      });
      if (res.ok) {
        setSysConfig(prev => ({ ...prev, maintenanceMode: newMode }));
        addNotification('System', `Maintenance mode is now ${newMode ? 'ON' : 'OFF'}`, newMode ? 'warning' : 'success');
        fetch(`${BACKEND_BASE}/admin/logs`).then(r => r.json()).then(setAuditLogs).catch(()=>{});
      }
    } catch(e) {
      addNotification('Error', 'Failed to toggle maintenance mode', 'error');
    }
  };

  const manageCategories = async () => {
    const cat = window.prompt(`Current Categories:\n${sysConfig.categories?.join(', ') || 'None'}\n\nEnter new global category name to add:`);
    if (cat && cat.trim()) {
      try {
        const res = await fetch(`${BACKEND_BASE}/admin/config/categories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ adminUid: currentUser?.uid || 'admin', category: cat.trim() })
        });
        if (res.ok) {
          const data = await res.json();
          setSysConfig(prev => ({ ...prev, categories: data.categories }));
          addNotification('Categories Update', `Added new global category: ${cat.trim()}`, 'success');
          fetch(`${BACKEND_BASE}/admin/logs`).then(r => r.json()).then(setAuditLogs).catch(()=>{});
        }
      } catch(e) {
        addNotification('Error', 'Failed to add category', 'error');
      }
    }
  };

  const stats = [
    { label: 'Total Users', value: adminStats.totalUsers.toString(), icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
    { label: 'Platform Volume', value: `$${(adminStats.income + adminStats.expenses).toLocaleString()}`, icon: Activity, color: 'text-secondary', bg: 'bg-secondary/10' },
    { label: 'DB Engine', value: dbStatus, icon: Database, color: dbStatus === 'Active' ? 'text-tertiary' : 'text-error', bg: 'bg-tertiary/10' },
    { label: 'System Flags', value: adminStats.flags.toString(), icon: ShieldAlert, color: adminStats.flags > 0 ? 'text-error' : 'text-neutral-500', bg: 'bg-error/10' },
  ];

  const toggleStatus = async (user) => {
    let newStatus = 'Active';
    if (user.status === 'Active') newStatus = 'Suspended';
    if (user.status === 'Pending') newStatus = 'Active';

    try {
      const res = await fetch(`${BACKEND_BASE}/admin/users/${user.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        if (newStatus === 'Active') {
          addNotification('Account Activated', `User ${user.name} is now active.`, 'success');
        } else {
          addNotification('Account Suspended', `User ${user.name} has been suspended.`, 'warning');
        }
      }
    } catch (e) {
      addNotification('Update Failed', 'Could not sync status with database.', 'error');
    }
  };

  const toggleRole = async (user) => {
    const nextRole = user.role === 'Super Admin' ? 'User' : 'Super Admin';
    try {
      const res = await fetch(`${BACKEND_BASE}/admin/users/${user.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: nextRole })
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, role: nextRole } : u));
        addNotification('Role Updated', `${user.name} is now a ${nextRole}.`, 'success');
      }
    } catch (e) {
      addNotification('Error', 'Failed to update user role.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (id === currentUser?.uid || id === 'user_admin') {
      addNotification('Access Denied', 'You cannot delete the active Super Admin account.', 'danger');
      return;
    }
    
    if (!window.confirm("Are you sure you want to permanently delete this account? This action is irreversible.")) return;

    try {
      const res = await fetch(`${BACKEND_BASE}/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        addNotification('Account Deleted', 'The user account has been permanently removed.', 'success');
      }
    } catch (e) {
      addNotification('Delete Failed', 'Could not delete user from system.', 'error');
    }
  };

  const handlePasswordReset = async (user) => {
    try {
      const res = await fetch(`${BACKEND_BASE}/admin/users/${user.id}/reset-password`, { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUid: currentUser.uid })
      });
      const data = await res.json();
      if (res.ok) {
        addNotification('Password Reset', `Temporary password for ${user.email} is: ${data.newPassword}`, 'success');
      }
    } catch (e) {
      addNotification('Reset Failed', 'Failed to generate new credentials.', 'error');
    }
  };

  const exportToCSV = () => {
    const headers = ['Identity', 'Email', 'Role', 'Status', 'Balance', 'TxCount', 'JoinDate'];
    const rows = users.map(u => [u.name, u.email, u.role, u.status, u.balance, u.txCount, u.joinDate]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fintrack_audit_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    addNotification('Report Generated', 'Audit CSV has been downloaded.', 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-textMain font-body selection:bg-primary selection:text-on-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,82,82,0.05)_0%,rgba(11,19,38,0)_60%)]"></div>
        <Link to="/" className="absolute top-8 left-8 text-sm font-bold text-textMuted hover:text-textMain transition-colors">← Back to Site</Link>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface shadow-soft p-10 rounded-[2rem] border border-borderLight w-full max-w-md shadow-2xl relative z-10"
        >
          <div className="w-16 h-16 rounded-2xl bg-error/10 border border-error/20 flex items-center justify-center mb-6 mx-auto">
            <Lock className="text-error" size={32} />
          </div>
          <h1 className="text-2xl font-bold font-headline text-center mb-2">Restricted Access</h1>
          <p className="text-textMuted text-center mb-8 text-sm">Please provide the master administrative key to enter the override console.</p>
          
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <input 
                type="password"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                placeholder="Master Key"
                className="w-full bg-background border border-borderLight focus:border-error focus:ring-1 focus:ring-error rounded-xl px-4 py-3 text-textMain outline-none transition-all placeholder:text-neutral-600 text-center tracking-[0.3em] font-mono"
                autoFocus
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-error text-textMain font-bold py-3 rounded-xl hover:bg-error/80 transition-colors flex justify-center items-center gap-2"
            >
              Verify Identity <ChevronRight size={18} />
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (selectedUser) {
    // Use investigated finance data if available, otherwise fallback to local/simulated
    const userActivity = investigatedFinance?.transactions || transactions || [];
    
    const totalIncome = userActivity.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    const totalExpenses = userActivity.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(parseFloat(t.amount)), 0);
    const calculatedBalance = investigatedFinance?.accounts?.reduce((sum, a) => sum + parseFloat(a.balance), 0) || (totalIncome - totalExpenses);

    // Isolate context to render the actual literal Dashboard component with real DB data
    const mockAuthContext = { currentUser: { name: selectedUser.name, email: selectedUser.email, uid: selectedUser.id } };
    const mockFinanceContext = {
      transactions: userActivity,
      accounts: investigatedFinance?.accounts || [{ id: 'bank', name: 'Virtual Reserve', type: 'Bank', balance: calculatedBalance }],
      goals: investigatedFinance?.goals || [],
      budgets: investigatedFinance?.budgets || [],
      currency: investigatedFinance?.currency || 'USD',
      currencySymbol: '$',
      formatCurrency: (val) => `$${val.toLocaleString()}`
    };

    return (
      <div className="min-h-screen bg-background text-textMain font-body selection:bg-primary selection:text-on-primary pb-20">
        <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-background/80 backdrop-blur-xl border-b border-borderLight">
          <div className="flex items-center gap-2 md:gap-4">
            <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-sm font-bold text-textMuted hover:text-textMain transition-colors bg-surface shadow-soft px-3 md:px-4 py-2 rounded-xl border border-borderLight whitespace-nowrap">
              <ArrowLeft size={16} /> <span className="hidden sm:inline">Directory</span>
            </button>
            <span className="text-secondary font-bold text-xs md:text-sm ml-2 md:ml-4 border-l border-borderLight pl-2 md:pl-4">Investigating Profile: <span className="truncate max-w-[100px] inline-block align-bottom">{selectedUser.name}</span></span>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto p-6 lg:p-12 space-y-12">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-8">
            {/* Identity Card */}
            <div className="bg-surface shadow-soft p-8 rounded-[2rem] border border-borderLight lg:w-1/3 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-surface-highest flex items-center justify-center mb-6 shadow-xl border-4 border-[#0b1326]">
                <User size={40} className="text-primary" />
              </div>
              <h2 className="text-xl font-bold text-textMain mb-1">{selectedUser.name}</h2>
              <p className="text-textMuted text-sm mb-6 flex items-center justify-center gap-2"><Mail size={12}/> {selectedUser.email}</p>
              
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center p-3 bg-surface shadow-softest/50 rounded-xl border border-borderLight">
                  <span className="text-xs text-textMuted uppercase tracking-widest font-bold">Role</span>
                  <span className={`text-xs font-bold ${selectedUser.role === 'Super Admin' ? 'text-primary' : 'text-secondary'}`}>{selectedUser.role}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface shadow-softest/50 rounded-xl border border-borderLight">
                  <span className="text-xs text-textMuted uppercase tracking-widest font-bold">Status</span>
                  <span className={`text-xs font-bold ${selectedUser.status === 'Active' ? 'text-primary' : selectedUser.status === 'Suspended' ? 'text-error' : 'text-neutral-500'}`}>{selectedUser.status}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-surface shadow-softest/50 rounded-xl border border-borderLight">
                  <span className="text-xs text-textMuted uppercase tracking-widest font-bold">Joined</span>
                  <span className="text-xs font-mono text-textMain">{selectedUser.joinDate}</span>
                </div>
              </div>
            </div>

            {/* Activity Stream */}
            <div className="bg-surface shadow-soft p-8 rounded-[2rem] border border-borderLight lg:w-2/3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold font-headline text-textMain">Audited Activity Feed</h3>
                <span className="text-xs text-textMuted font-mono bg-surface shadow-softest px-3 py-1 rounded-lg border border-borderLight">Latest {userActivity.length}</span>
              </div>
              
              <div className="space-y-4 max-h-[300px] overflow-y-auto hide-scrollbar border-y border-outline-variant/5 py-4">
                {userActivity.length > 0 ? (
                  userActivity.map((tx, idx) => (
                    <motion.div 
                      key={tx._id || idx}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                      className="flex items-center justify-between p-4 bg-surface-highest/20 rounded-xl border border-outline-variant/5 hover:border-borderLight transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {tx.amount > 1000 && <span className="text-[10px] font-bold text-error uppercase tracking-widest bg-error/10 px-2 py-0.5 rounded border border-error/20 flex items-center gap-1"><ShieldAlert size={10}/> High Risk</span>}
                        <div className={`p-3 rounded-xl border ${tx.type === 'income' ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-secondary/10 border-secondary/20 text-secondary'}`}>
                           <Activity size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-textMain mb-1">{tx.name || tx.description}</p>
                          <p className="text-xs text-textMuted flex items-center gap-2">
                             <Calendar size={10} /> {new Date(tx.date).toLocaleDateString()}
                             <span className="w-1 h-1 rounded-full bg-outline-variant/50"></span>
                             {tx.category || 'System Event'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-primary' : 'text-textMain'}`}>
                          {tx.type === 'income' ? '+' : '-'} ${tx.amount}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-10 text-textMuted">No system activity logged for this user.</div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Fully Isolated Literal User Dashboard Projection */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="w-full bg-surface border border-primary/20 rounded-[2.5rem] overflow-hidden shadow-[0_0_50px_rgba(78,222,163,0.05)] relative"
          >
             <div className="bg-primary/10 backdrop-blur-md px-8 py-4 border-b border-primary/20 flex items-center justify-between">
                <span className="text-primary font-bold text-sm tracking-widest uppercase flex items-center gap-2"><Eye size={18}/> Live Dashboard Projection</span>
                <span className="text-xs text-primary/70 font-mono tracking-wider">SECURE INSTANCE RUNNING AT /{selectedUser.id}/dashboard</span>
             </div>
             
             {/* Virtual Screen Environment */}
             <div className="p-4 md:p-8 h-[850px] overflow-y-auto hide-scrollbar bg-surface relative rounded-b-[2.5rem]">
                <AuthContext.Provider value={mockAuthContext}>
                   <FinanceContext.Provider value={mockFinanceContext}>
                      <Dashboard />
                   </FinanceContext.Provider>
                </AuthContext.Provider>
             </div>
          </motion.div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-textMain font-body selection:bg-primary selection:text-on-primary">
      {/* Top Navbar */}
      <nav className="sticky top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-background/80 backdrop-blur-xl border-b border-borderLight">
        <div className="flex items-center gap-4">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-primary font-headline">AuraFinance</span>
          <span className="text-xs font-bold text-textMuted uppercase tracking-widest border-l border-borderLight pl-4 ml-4 hidden md:block">Admin Console</span>
        </div>
          <div className="flex gap-2 sm:gap-4">
            <button onClick={exportToCSV} className="text-xs sm:text-sm font-bold text-secondary hover:text-textMain transition-colors bg-secondary/10 px-3 sm:px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap"><Database size={16}/> <span className="hidden sm:inline">Export Audit CSV</span><span className="sm:hidden">Export</span></button>
            <Link to="/" className="text-xs sm:text-sm font-bold text-textMuted hover:text-textMain transition-colors bg-surface shadow-soft px-3 sm:px-4 py-2 rounded-xl whitespace-nowrap"><span className="hidden sm:inline">Return to Portal</span><span className="sm:hidden">Portal</span></Link>
          </div>
      </nav>

      <div className="space-y-8 max-w-7xl mx-auto p-6 lg:p-12">
      
      {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-error/10 border border-error/20 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-error">Master Console</span>
            </div>
            <h1 className="text-3xl font-extrabold font-headline tracking-tight text-textMain">System Administration</h1>
            <p className="text-textMuted mt-2">Global database controls and security oversight.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 bg-surface shadow-soft p-2 rounded-2xl border border-outline-variant/5">
             <div className="relative">
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search user ID or email..." 
                  className="bg-background border border-borderLight rounded-xl px-4 py-2 pl-10 text-xs w-64 focus:border-primary outline-none transition-all"
                />
                <Users className="absolute left-3 top-2.5 text-textMuted" size={14} />
             </div>
             <select 
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               className="bg-background border border-borderLight rounded-xl px-4 py-2 text-xs text-textMuted outline-none"
             >
                <option value="">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Suspended">Suspended</option>
             </select>
          </div>
        </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-surface shadow-soft p-6 rounded-[2rem] border border-borderLight flex items-center gap-6"
          >
            <div className={`w-14 h-14 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center border border-borderLight`}>
              <stat.icon size={26} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-widest uppercase text-textMuted mb-1">{stat.label}</p>
              <h2 className={`text-2xl font-black font-headline ${stat.color}`}>{stat.value}</h2>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-surface border border-borderLight rounded-[2rem] overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-borderLight px-6 pt-4 gap-8">
          <button 
            onClick={() => setActiveTab('users')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase relative outline-none transition-colors ${activeTab === 'users' ? 'text-primary' : 'text-textMuted hover:text-textMain'}`}
          >
            User Access
            {activeTab === 'users' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('system')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase relative outline-none transition-colors ${activeTab === 'system' ? 'text-primary' : 'text-textMuted hover:text-textMain'}`}
          >
            System Operations
            {activeTab === 'system' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-primary" />}
          </button>
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`pb-4 text-sm font-bold tracking-widest uppercase relative outline-none transition-colors ${activeTab === 'analytics' ? 'text-primary' : 'text-textMuted hover:text-textMain'}`}
          >
            System Analytics
            {activeTab === 'analytics' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 w-full h-1 rounded-t-full bg-primary" />}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'users' && (
              <motion.div 
                key="users"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="overflow-x-auto"
              >
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="border-b border-borderLight">
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted pl-4">Account ID</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted">Identity</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted">Balance</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted">Txns</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted">Status</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted">Last Origin</th>
                      <th className="pb-4 text-[10px] font-bold uppercase tracking-widest text-textMuted text-right pr-4">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-outline-variant/5 hover:bg-surface-high/50 transition-colors group">
                        <td className="py-5 pl-4 text-sm text-textMuted font-mono">#{u.id.toString().slice(-4)}</td>
                        <td className="py-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-highest border border-borderLight flex items-center justify-center font-bold text-primary">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-textMain flex items-center gap-2">
                                {u.isSuspicious && <ShieldAlert size={12} className="text-error" />}
                                {u.name}
                              </p>
                              <p className="text-xs text-textMuted flex items-center gap-1"><Mail size={10}/> {u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 font-mono text-sm text-textMain font-bold">${u.balance?.toLocaleString()}</td>
                        <td className="py-5 text-sm text-textMuted">{u.txCount}</td>
                        <td className="py-5">
                          <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'Active' ? 'text-primary' : u.status === 'Suspended' ? 'text-error' : 'text-neutral-500'}`}>
                            {u.status === 'Active' && <CheckCircle2 size={14} />}
                            {u.status === 'Suspended' && <Ban size={14} />}
                            {u.status}
                          </span>
                        </td>
                        <td className="py-5 text-sm text-textMuted">{u.lastLogin}</td>
                        <td className="py-5 pr-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setSelectedUser(u)} className="p-2 text-textMuted hover:text-textMain bg-surface shadow-softest rounded-lg hover:bg-surface-high transition-colors" title="Investigate Profile">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => handlePasswordReset(u)} className="p-2 text-textMuted hover:text-primary bg-surface shadow-softest rounded-lg hover:bg-primary/10 transition-colors" title="Force Password Reset">
                              <RotateCcw size={16} />
                            </button>
                            <button onClick={() => toggleRole(u)} className="p-2 text-textMuted hover:text-secondary bg-surface shadow-softest rounded-lg hover:bg-secondary/10 transition-colors" title="Switch Role">
                              <Lock size={16} />
                            </button>
                            <button onClick={() => toggleStatus(u)} className={`p-2 rounded-lg transition-colors ${u.status === 'Active' ? 'text-textMuted hover:text-secondary bg-surface shadow-softest hover:bg-secondary/10' : 'text-error hover:text-primary hover:bg-[#4edea3]/10 bg-error/10'}`} title={u.status === 'Active' ? 'Suspend Account' : 'Activate Account'}>
                              {u.status === 'Active' ? <Ban size={16} /> : <CheckCircle2 size={16} />}
                            </button>
                            <button onClick={() => handleDelete(u.id)} className="p-2 text-textMuted hover:text-error bg-surface shadow-softest rounded-lg hover:bg-error/10 transition-colors" title="Terminate Account">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan="7" className="py-12 text-center text-textMuted">No matching records found in database.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </motion.div>
            )}
            {activeTab === 'system' && (
              <motion.div 
                key="system"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-surface shadow-soft p-6 rounded-[1.5rem] border border-borderLight">
                    <h3 className="text-lg font-bold font-headline text-textMain mb-2">Platform Maintenance</h3>
                    <p className="text-sm text-textMuted mb-6">Engage maintenance mode to lock out all non-admin users during network upgrades.</p>
                    <button onClick={toggleMaintenance} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors w-full flex justify-center gap-2 items-center ${sysConfig.maintenanceMode ? 'bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20 hover:bg-[#10b981]/20' : 'bg-error/10 text-error border border-error/20 hover:bg-error/20'}`}>
                      {sysConfig.maintenanceMode ? <CheckCircle2 size={16} /> : <ShieldAlert size={16} />}
                      {sysConfig.maintenanceMode ? 'Disable Maintenance Lockdown' : 'Enable Maintenance Lockdown'}
                    </button>
                  </div>
                  
                  <div className="bg-surface shadow-soft p-6 rounded-[1.5rem] border border-borderLight">
                    <h3 className="text-lg font-bold font-headline text-textMain mb-2">Category Management</h3>
                    <p className="text-sm text-textMuted mb-6">Modify the global category labels used across all user financial statements.</p>
                    <button onClick={manageCategories} className="px-5 py-2.5 bg-surface-highest text-textMain border border-borderLight hover:border-primary/50 hover:text-primary rounded-xl text-sm font-bold transition-colors w-full flex justify-center gap-2 items-center">
                      <Database size={16} /> Manage Categories
                    </button>
                  </div>
                </div>

                <div className="bg-surface shadow-soft p-6 rounded-[2rem] border border-borderLight">
                  <h3 className="text-lg font-bold font-headline text-textMain mb-6">Audit Trail & Action Logs</h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4">
                    {auditLogs.length > 0 ? auditLogs.map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-4 bg-surface-high/30 rounded-xl border border-outline-variant/5">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                             <Activity size={14}/>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-textMain">{log.action}</p>
                            <p className="text-[10px] text-textMuted">Admin: #{log.adminUid?.slice(-4)} | Details: {log.details}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-textMuted font-mono">{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    )) : <div className="text-center py-10 text-textMuted">No system logs recorded yet.</div>}
                  </div>
                </div>
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div 
                key="analytics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-surface shadow-soft p-6 rounded-[2rem] border border-borderLight h-96 flex flex-col">
                    <h3 className="text-lg font-bold font-headline text-textMain mb-6 flex items-center gap-2"><TrendingUp className="text-primary"/> Platform Volume Trend</h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                          <XAxis dataKey="name" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value/1000}k`} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}
                            itemStyle={{ color: 'var(--color-text-main)' }}
                          />
                          <Line type="monotone" dataKey="volume" stroke="#10b981" strokeWidth={4} dot={{ r: 6, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div className="bg-surface shadow-soft p-6 rounded-[2rem] border border-borderLight h-96 flex flex-col">
                    <h3 className="text-lg font-bold font-headline text-textMain mb-6 flex items-center gap-2"><Users className="text-secondary"/> User Acquisition</h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                          <XAxis dataKey="name" stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#8884d8" fontSize={12} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: 'var(--glass-bg)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}/>
                          <Bar dataKey="users" fill="#6366f1" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Admin;
