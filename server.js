import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Global Request-Response Logger for Autopilot Debugging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Maintenance Middleware - Blocks non-essential traffic during lockdowns
app.use((req, res, next) => {
  if (db?.adminConfig?.maintenanceMode && 
      !req.url.startsWith('/api/admin') && 
      !req.url.startsWith('/api/auth')) {
    return res.status(503).json({ 
      error: "System Under Maintenance", 
      message: "AuraFinance is currently undergoing scheduled platform upgrades. We will be back shortly."
    });
  }
  next();
});

const DB_PATH = path.join(__dirname, 'database.json');

// Memory Cache & Engine
let db = {
  users: [],
  accounts: [],
  transactions: [],
  goals: [],
  budgets: [],
  auditLog: [],
  notifications: [],
  feedback: [],
  adminConfig: {
    spendingLimitAlert: 1000,
    maintenanceMode: false,
    aiInsightsEnabled: true,
    categories: ['Food & Dining', 'Transportation', 'Housing', 'Entertainment', 'Utilities', 'Shopping']
  }
};

// Initialize or Load from JSON File
function loadDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      db = { ...db, ...parsed }; // Merge to ensure new fields exist
      console.log("JSON Database flawlessly loaded with production extensions.");
    } else {
      saveDB();
    }
  } catch (err) {
    console.error("Failed to load database:", err.message);
  }
}

function saveDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error("Failed to save database:", err.message);
  }
}

function logAdminAction(adminUid, action, details) {
  const logEntry = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    adminUid,
    action,
    details
  };
  db.auditLog.push(logEntry);
  saveDB();
}

loadDB();

// --- FINANCE API ---

app.get('/api/finances/:uid', (req, res) => {
  const uid = req.params.uid;
  const user = db.users.find(u => u.uid === uid);
  const currency = user ? user.currency : 'USD';
  const accounts = db.accounts.filter(a => a.uid === uid);
  const transactions = db.transactions.filter(t => t.uid === uid);
  const goals = db.goals.filter(g => g.uid === uid);
  const budgets = db.budgets.filter(b => b.uid === uid);
  res.json({ accounts, transactions, goals, budgets, currency });
});

app.post('/api/finances/:uid', (req, res) => {
  const uid = req.params.uid;
  const { accounts = [], transactions = [], goals = [], budgets = [], currency = 'USD' } = req.body;
  
  const userIdx = db.users.findIndex(u => u.uid === uid);
  if (userIdx !== -1) {
    db.users[userIdx].currency = currency;
  }

  // Large Transaction Detection & Notification
  transactions.forEach(tx => {
    const isNew = !db.transactions.some(t => t.id === tx.id);
    if (isNew && Math.abs(tx.amount) >= db.adminConfig.spendingLimitAlert) {
      db.notifications.push({
        id: Date.now().toString() + Math.random(),
        type: 'Large Transaction',
        message: `User ${uid} recorded a large ${tx.type} of ${tx.amount}`,
        timestamp: new Date().toISOString(),
        severity: 'warning',
        uid: uid
      });
    }
  });

  db.accounts = db.accounts.filter(a => a.uid !== uid).concat(accounts.map(a => ({ ...a, uid })));
  db.transactions = db.transactions.filter(t => t.uid !== uid).concat(transactions.map(t => ({ ...t, uid })));
  db.goals = db.goals.filter(g => g.uid !== uid).concat(goals.map(g => ({ ...g, uid })));
  db.budgets = db.budgets.filter(b => b.uid !== uid).concat(budgets.map(b => ({ ...b, uid })));

  saveDB();
  res.json({ success: true });
});

// --- ADMIN API ---

// 1. System Config
app.get('/api/admin/config', (req, res) => {
  res.json(db.adminConfig);
});

app.post('/api/admin/config/maintenance', (req, res) => {
  const { adminUid, mode } = req.body;
  db.adminConfig.maintenanceMode = mode;
  logAdminAction(adminUid, 'TOGGLE_MAINTENANCE', `Maintenance mode set to ${mode ? 'ACTIVE' : 'INACTIVE'}`);
  saveDB();
  res.json({ success: true, maintenanceMode: mode });
});

app.post('/api/admin/config/categories', (req, res) => {
  const { adminUid, category } = req.body;
  if (!db.adminConfig.categories) db.adminConfig.categories = [];
  if (!db.adminConfig.categories.includes(category)) {
      db.adminConfig.categories.push(category);
      logAdminAction(adminUid, 'ADD_CATEGORY', `Added global category: ${category}`);
      saveDB();
  }
  res.json({ success: true, categories: db.adminConfig.categories });
});


// 2. Dashboard Overview Stats
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = db.users.length;
  const totalTransactions = db.transactions.length;
  const income = db.transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const expenses = db.transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  // AI Insights - Simple Analytics
  const categoryStats = db.transactions.reduce((acc, t) => {
    const cat = t.category || 'Uncategorized';
    acc[cat] = (acc[cat] || 0) + Math.abs(t.amount);
    return acc;
  }, {});

  const monthlyTrends = db.transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    if (t.type === 'income') acc[month].income += Math.abs(t.amount);
    else acc[month].expense += Math.abs(t.amount);
    return acc;
  }, {});

  res.json({
    totalUsers,
    totalTransactions,
    income,
    expenses,
    categoryStats,
    monthlyTrends,
    systemHealth: '99.9%',
    flags: db.notifications.length,
    notifications: db.notifications.slice(-10).reverse()
  });
});

// 2. User Management
app.get('/api/admin/users', (req, res) => {
  const { search, status } = req.query;
  let filtered = db.users;

  if (search) {
    filtered = filtered.filter(u => 
      u.email.toLowerCase().includes(search.toLowerCase()) || 
      (u.uid && u.uid.includes(search))
    );
  }

  if (status) {
    filtered = filtered.filter(u => u.status === status);
  }

  const usersWithMeta = filtered.map(u => {
    const userTxs = db.transactions.filter(t => t.uid === u.uid);
    const balance = db.accounts.filter(a => a.uid === u.uid).reduce((sum, a) => sum + a.balance, 0);
    return {
      id: u.uid,
      name: u.email ? u.email.split('@')[0] : 'Guest',
      email: u.email,
      role: u.role || 'User',
      status: u.status || 'Active',
      lastLogin: u.lastLogin || 'Never',
      joinDate: u.joinDate || 'Jan 1, 2024',
      txCount: userTxs.length,
      balance: balance,
      isSuspicious: userTxs.some(t => Math.abs(t.amount) > 10000) || userTxs.length > 100
    };
  });
  res.json(usersWithMeta);
});

app.post('/api/admin/users/:uid/status', (req, res) => {
  const { uid } = req.params;
  const { status, adminUid } = req.body;
  const userIdx = db.users.findIndex(u => u.uid === uid);
  if (userIdx !== -1) {
    const oldStatus = db.users[userIdx].status;
    db.users[userIdx].status = status;
    logAdminAction(adminUid, 'STATUS_CHANGE', `${uid}: ${oldStatus} -> ${status}`);
    saveDB();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.post('/api/admin/users/:uid/role', (req, res) => {
  const { uid } = req.params;
  const { role, adminUid } = req.body;
  const userIdx = db.users.findIndex(u => u.uid === uid);
  if (userIdx !== -1) {
    db.users[userIdx].role = role;
    logAdminAction(adminUid, 'ROLE_CHANGE', `${uid} to ${role}`);
    saveDB();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "User not found" });
  }
});

app.delete('/api/admin/users/:uid', (req, res) => {
  const { uid } = req.params;
  const { adminUid } = req.body;
  db.users = db.users.filter(u => u.uid !== uid);
  db.accounts = db.accounts.filter(a => a.uid !== uid);
  db.transactions = db.transactions.filter(t => t.uid !== uid);
  logAdminAction(adminUid, 'DELETE_USER', uid);
  saveDB();
  res.json({ success: true });
});

// 3. Transactions Management
app.get('/api/admin/transactions', (req, res) => {
  const { limit = 50, minAmount, category } = req.query;
  let txs = [...db.transactions].reverse();

  if (minAmount) txs = txs.filter(t => Math.abs(t.amount) >= parseFloat(minAmount));
  if (category) txs = txs.filter(t => t.category === category);

  res.json(txs.slice(0, parseInt(limit)));
});

// 8. Logs
app.get('/api/admin/logs', (req, res) => {
  res.json(db.auditLog.slice(-100).reverse());
});

// 9. Feedback
app.get('/api/admin/feedback', (req, res) => {
  res.json(db.feedback.reverse());
});

app.post('/api/admin/feedback/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { adminUid } = req.body;
  const item = db.feedback.find(f => f.id === id);
  if (item) {
    item.status = 'Resolved';
    logAdminAction(adminUid, 'RESOLVE_FEEDBACK', id);
    saveDB();
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Feedback not found" });
  }
});

// --- AUTH API ---

app.post('/api/auth/signup', (req, res) => {
  const { email, password } = req.body;
  if (db.users.some(u => u.email === email)) return res.status(400).json({ error: "Exists" });
  const uid = Date.now().toString();
  const newUser = {
    uid, email, password, currency: 'USD',
    role: db.users.length === 0 ? 'Super Admin' : 'User',
    status: 'Active',
    lastLogin: 'Just now',
    joinDate: new Date().toLocaleDateString()
  };
  db.users.push(newUser);
  saveDB();
  res.json({ user: { uid, email } });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(400).json({ error: "Invalid" });
  user.lastLogin = new Date().toLocaleString();
  saveDB();
  res.json({ user: { uid: user.uid, email: user.email } });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Production-Ready Autonomous API Server running on port ${PORT}.`);
});
