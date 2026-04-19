/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export const FinanceContext = createContext();

export const useFinance = () => useContext(FinanceContext);

const DEFAULT_ACCOUNTS = [
  { id: 'bank', name: 'Chase Checking', type: 'Bank', balance: 8450.42 },
  { id: 'savings', name: 'Marcus Savings', type: 'High Yield Savings', balance: 25000.00 },
  { id: 'wallet', name: 'Ethereum Wallet', type: 'Crypto', balance: 3420.15 },
  { id: 'cash', name: 'Physical Cash', type: 'Cash', balance: 250.00 },
];

const DEFAULT_GOALS = [
  { id: 1, name: 'Emergency Fund', target: 20000, saved: 14500, deadline: '2026-12-31' },
  { id: 2, name: 'Tesla Model 3', target: 45000, saved: 12000, deadline: '2027-06-15' },
  { id: 3, name: 'Japan Trip 2026', target: 8000, saved: 6200, deadline: '2026-08-01' },
];

const DEFAULT_BUDGETS = [
  { id: 1, category: 'Food & Dining', limit: 1200, spent: 840 },
  { id: 2, category: 'Transportation', limit: 500, spent: 420 },
  { id: 3, category: 'Housing', limit: 2500, spent: 2500 },
  { id: 4, category: 'Entertainment', limit: 400, spent: 310 },
  { id: 5, category: 'Utilities', limit: 300, spent: 215 },
  { id: 6, category: 'Shopping', limit: 600, spent: 540 },
];

const generateDefaultTransactions = () => {
  const now = new Date();
  const txs = [
    { id: 'tx-0', accountId: 'bank', name: 'Monthly Salary', date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(), amount: 6500, type: 'income', category: 'Salary' },
    { id: 'tx-1', accountId: 'bank', name: 'Rent Payment', date: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000).toISOString(), amount: 2500, type: 'expense', category: 'Housing' },
    { id: 'tx-2', accountId: 'bank', name: 'Apple Store', date: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(), amount: 1200, type: 'expense', category: 'Shopping' },
    { id: 'tx-3', accountId: 'bank', name: 'Whole Foods', date: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000).toISOString(), amount: 240, type: 'expense', category: 'Food & Dining' },
    { id: 'tx-4', accountId: 'bank', name: 'Uber Ride', date: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(), amount: 45.20, type: 'expense', category: 'Transportation' },
    { id: 'tx-5', accountId: 'savings', name: 'Interest Credit', date: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(), amount: 120.40, type: 'income', category: 'Interest' },
    { id: 'tx-6', accountId: 'bank', name: 'Freelance Payout', date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), amount: 850, type: 'income', category: 'Freelance' },
    { id: 'tx-7', accountId: 'bank', name: 'Netflix Subscription', date: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(), amount: 15.99, type: 'expense', category: 'Entertainment' },
    { id: 'tx-8', accountId: 'bank', name: 'Gas Station', date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), amount: 65, type: 'expense', category: 'Transportation' },
    { id: 'tx-9', accountId: 'wallet', name: 'Ethereum Sell', date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), amount: 450, type: 'income', category: 'Crypto' },
    { id: 'tx-10', accountId: 'bank', name: 'Starbucks', date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), amount: 12.50, type: 'expense', category: 'Food & Dining' },
    { id: 'tx-11', accountId: 'bank', name: 'Amazon Express', date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(), amount: 84.30, type: 'expense', category: 'Shopping' },
  ];
  return txs;
};

export const FinanceProvider = ({ children }) => {
  const { currentUser } = useAuth();
  
  const [currency, setCurrency] = useState(() => {
    const saved = localStorage.getItem('fintrack_currency');
    return (saved && saved !== 'undefined' && saved !== 'null') ? saved : 'USD';
  });

  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem('fintrack_accounts');
      if (!saved || saved === 'undefined' || saved === 'null') return DEFAULT_ACCOUNTS;
      const parsed = JSON.parse(saved);
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : DEFAULT_ACCOUNTS;
    } catch (e) { return DEFAULT_ACCOUNTS; }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('fintrack_transactions');
      if (!saved || saved === 'undefined' || saved === 'null') return generateDefaultTransactions();
      const parsed = JSON.parse(saved);
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : generateDefaultTransactions();
    } catch (e) { return generateDefaultTransactions(); }
  });

  const [goals, setGoals] = useState(() => {
    try {
      const saved = localStorage.getItem('fintrack_goals');
      if (!saved || saved === 'undefined' || saved === 'null') return DEFAULT_GOALS;
      const parsed = JSON.parse(saved);
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : DEFAULT_GOALS;
    } catch (e) { return DEFAULT_GOALS; }
  });

  const [budgets, setBudgets] = useState(() => {
    try {
      const saved = localStorage.getItem('fintrack_budgets');
      if (!saved || saved === 'undefined' || saved === 'null') return DEFAULT_BUDGETS;
      const parsed = JSON.parse(saved);
      return (Array.isArray(parsed) && parsed.length > 0) ? parsed : DEFAULT_BUDGETS;
    } catch (e) { return DEFAULT_BUDGETS; }
  });
  
  const [dbLoading, setDbLoading] = useState(false);
  const BACKEND_URL = `http://${window.location.hostname}:5000/api/finances`;

  // Load from MySQL Backend on mount if user is logged in
  useEffect(() => {
    if (currentUser) {
      const fetchData = async () => {
        setDbLoading(true);
        try {
          const res = await fetch(`${BACKEND_URL}/${currentUser.uid}`);
          if (res.ok) {
            const data = await res.json();
            if (data) {
              setAccounts(data.accounts && data.accounts.length > 0 ? data.accounts : DEFAULT_ACCOUNTS);
              setTransactions(data.transactions && data.transactions.length > 0 ? data.transactions : generateDefaultTransactions());
              setGoals(data.goals && data.goals.length > 0 ? data.goals : DEFAULT_GOALS);
              setBudgets(data.budgets && data.budgets.length > 0 ? data.budgets : DEFAULT_BUDGETS);
              if (data.currency) setCurrency(data.currency);
            } else {
              // Sync default data to server
              await fetch(`${BACKEND_URL}/${currentUser.uid}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accounts, transactions, currency, goals, budgets })
              }).catch(() => {});
            }
          }
        } catch (e) {
          console.error("Error fetching from MySQL Backend:", e);
        }
        setDbLoading(false);
      };
      fetchData();
    }
  }, [currentUser]);

  // General syncer
  const syncToDB = async (dataPayload) => {
    try {
      await fetch(`${BACKEND_URL}/${currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataPayload)
      });
    } catch(e) {
      console.error("Error saving to backend", e);
    }
  };

  // Sync back to MySQL Backend on changes, and update LocalStorage
  useEffect(() => {
    localStorage.setItem('fintrack_accounts', JSON.stringify(accounts));
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
    localStorage.setItem('fintrack_currency', currency);
    localStorage.setItem('fintrack_goals', JSON.stringify(goals));
    localStorage.setItem('fintrack_budgets', JSON.stringify(budgets));
    
    if (currentUser && !dbLoading) {
      syncToDB({ accounts, transactions, currency, goals, budgets });
    }
  }, [accounts, transactions, currency, goals, budgets, currentUser, dbLoading]);

  // Safeguard against polluted environments that crash native Intl functions
  const safeCurrency = (currency && currency !== 'undefined' && currency !== 'null') ? currency : 'USD';

  // Automatically extracts the symbol ($/€/₹) bypassing digits to cleanly prefix rolling counters
  const currencySymbol = (0).toLocaleString('en-US', { style: 'currency', currency: safeCurrency }).replace(/[\d.,]/g, '').trim();
  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: safeCurrency }).format(amount);

  const addTransaction = (accountId, name, amount, type) => {
    const newTx = {
      id: Date.now().toString(),
      accountId,
      name,
      date: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
      amount: type === 'expense' ? -Math.abs(amount) : Math.abs(amount),
      type
    };

    setTransactions(prev => [newTx, ...prev]);
    setAccounts(prev => prev.map(acc => {
      if (acc.id === accountId) {
        return { ...acc, balance: acc.balance + newTx.amount };
      }
      return acc;
    }));
  };

  const transferFunds = (fromId, toId, amount, memo = 'Transfer') => {
    if (fromId === toId) return Promise.reject(new Error("Cannot transfer to the same account."));
    if (amount <= 0) return Promise.reject(new Error("Amount must be greater than zero."));

    const fromAcc = accounts.find(a => a.id === fromId);
    if (!fromAcc) return Promise.reject(new Error("Source account not found."));
    if (fromAcc.balance < amount) return Promise.reject(new Error("Insufficient funds in source account."));

    const dateStr = new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    
    const txOut = {
      id: Date.now().toString() + '-out',
      accountId: fromId,
      name: `Transfer to ${accounts.find(a => a.id === toId)?.name || 'Account'} - ${memo}`,
      date: dateStr,
      amount: -amount,
      type: 'expense',
      isTransfer: true
    };
    
    const txIn = {
      id: Date.now().toString() + '-in',
      accountId: toId,
      name: `Transfer from ${fromAcc.name} - ${memo}`,
      date: dateStr,
      amount: amount,
      type: 'income',
      isTransfer: true
    };

    setTransactions(prev => [txOut, txIn, ...prev]);
    setAccounts(prev => prev.map(acc => {
      if (acc.id === fromId) return { ...acc, balance: acc.balance - amount };
      if (acc.id === toId) return { ...acc, balance: acc.balance + amount };
      return acc;
    }));

    return Promise.resolve();
  };

  const exportData = () => {
    const data = {
      accounts,
      transactions,
      goals,
      budgets,
      currency,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (jsonData) => {
    return new Promise((resolve, reject) => {
      try {
        const data = JSON.parse(jsonData);
        if (!data.accounts || !data.transactions) {
          throw new Error("Invalid backup file format. Missing core datasets.");
        }
        setAccounts(data.accounts);
        setTransactions(data.transactions);
        if (data.goals) setGoals(data.goals);
        if (data.budgets) setBudgets(data.budgets);
        if (data.currency) setCurrency(data.currency);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

  const value = {
    accounts,
    transactions,
    goals,
    setGoals,
    budgets,
    setBudgets,
    addTransaction,
    transferFunds,
    currency,
    setCurrency,
    currencySymbol,
    formatCurrency,
    exportData,
    importData,
    setTransactions,
    dbLoading
  };

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
};
