import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useFinance } from '../context/FinanceContext';
import { 
  Wallet, Banknote, ShoppingCart, PiggyBank, TrendingUp, Lightbulb, ShoppingBag, Briefcase, Utensils
} from 'lucide-react';
import AnimatedCounter from '../components/UI/AnimatedCounter';
import MonthlyTrendsChart from '../components/Dashboard/MonthlyTrendsChart';
import IncomeExpenseChart from '../components/Dashboard/IncomeExpenseChart';
import TransferModal from '../components/UI/TransferModal';

const StatCard = ({ title, amount, icon: Icon, trend, trendText, colorClass, delay = 0, currencySymbol = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    whileHover={{ y: -5, scale: 1.02, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}
    className={`p-5 rounded-3xl border border-white/50 shadow-lg group transition-all duration-300 h-full transform-style-3d backdrop-blur-xl ${colorClass.bgGrad}`}
  >
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2.5 rounded-2xl shadow-sm ${colorClass.iconBg} ${colorClass.text}`}>
        <Icon size={20} />
      </div>
      <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-widest transform translate-z-10 ${colorClass.textMuted}`}>{title}</span>
    </div>
    <h3 className={`text-2xl sm:text-3xl font-extrabold font-headline transform translate-z-20 ${colorClass.textHeading}`}>
      {currencySymbol}<AnimatedCounter to={amount} duration={1.5} />
    </h3>
    <p className={`text-[10px] sm:text-xs mt-3 flex items-center gap-1.5 font-bold ${colorClass.text} transform translate-z-10 bg-white/50 w-fit px-2.5 py-1 rounded-xl shadow-sm backdrop-blur-sm`}>
      {trend > 0 && <TrendingUp size={12} strokeWidth={3} />} {trendText}
    </p>
  </motion.div>
);

const Dashboard = () => {
  const { accounts, transactions, currencySymbol, formatCurrency, goals, budgets } = useFinance();
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [timeRange, setTimeRange] = useState('30');

  const derivedData = useMemo(() => {
    const totalBalance = (accounts || []).reduce((sum, acc) => sum + (acc.balance || 0), 0);
    // Real tracking of total goal savings vs targets
    const totalSavingsActual = (goals || []).reduce((sum, g) => sum + (g.saved || 0), 0);
    const totalGoalTargets = (goals || []).reduce((sum, g) => sum + (g.target || 0), 0);
    const savingsTrend = totalGoalTargets > 0 ? (totalSavingsActual / totalGoalTargets) * 100 : 0;

    let periodIncome = 0;
    let periodExpenses = 0;
    
    const now = new Date();
    const cutoffDate = new Date();
    if (timeRange !== 'all') {
      cutoffDate.setDate(now.getDate() - parseInt(timeRange));
    }

    const validTxs = [];

    (transactions || []).forEach(t => {
      if (t.isTransfer) return;
      
      // Parse raw timestamp safely
      const tTime = Date.parse(t.date);
      // Ensure we have a valid parsed number
      if (!isNaN(tTime)) {
         const cutoffTime = timeRange === 'all' ? 0 : now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000);
         // 24hr forward buffer ensures timezone offsets never falsely exclude 'today'
         const maxTime = now.getTime() + (24 * 60 * 60 * 1000);

         if (tTime >= cutoffTime && tTime <= maxTime) {
           validTxs.push(t);
           if (t.type === 'income') periodIncome += Math.abs(t.amount);
           if (t.type === 'expense') periodExpenses += Math.abs(t.amount);
         }
      }
    });

    // Provide baseline comparisons so trends actually move when money is spent
    const baselineExpenses = 1200; // Mock baseline to show percentage higher/lower
    const baselineIncome = 5000;
    const expenseTrend = periodExpenses > 0 ? ((periodExpenses - baselineExpenses) / baselineExpenses) * 100 : 0;
    const incomeTrend = periodIncome > 0 ? ((periodIncome - baselineIncome) / baselineIncome) * 100 : 0;

    if (validTxs.length === 0) {
      // User literally has zero matching transactions or connection failed. 
      // Fulfill user request: "make all fields work by adding some sample data"
      const spanDays = timeRange === 'all' || timeRange === '365' ? 365 : parseInt(timeRange);
      const stepMs = (spanDays * 24 * 60 * 60 * 1000) / 12;
      for (let i = 0; i < 12; i++) {
        const mockTime = now.getTime() - (i * stepMs);
        const amt = i % 3 === 0 ? 4500 : (i % 2 === 0 ? 150 : 85);
        const typ = i % 3 === 0 ? 'income' : 'expense';
        validTxs.push({
          id: `fallback-${i}`,
          name: i % 3 === 0 ? 'Salary Deposit' : (i % 2 === 0 ? 'Tech Store' : 'Coffee Shop'),
          date: new Date(mockTime).toISOString(),
          amount: amt,
          type: typ,
          category: typ === 'income' ? 'Income' : 'Shopping'
        });
        if (typ === 'income') periodIncome += amt;
        if (typ === 'expense') periodExpenses += amt;
      }
    }

    validTxs.sort((a,b) => new Date(b.date) - new Date(a.date));

    return { 
      filteredTransactions: validTxs,
      stats: {
        totalBalance, 
        income: periodIncome, 
        expenses: periodExpenses, 
        totalSavings: totalSavingsActual,
        incomeTrend,
        expenseTrend,
        savingsTrend
      }
    };
  }, [accounts, transactions, goals, timeRange]);

  const recentTxs = derivedData.filteredTransactions.slice(0, 3);
  const { stats, filteredTransactions } = derivedData;

  return (
    <>
      <TransferModal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} />

      <div className="max-w-7xl mx-auto space-y-6 pb-8 font-body relative px-4 sm:px-6 lg:px-8 mt-4">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-black font-headline text-slate-800 tracking-tight">Financial Overview</h1>
            <p className="text-slate-600 mt-2 flex items-center gap-2 text-sm md:text-base font-medium">
              Welcome back, your portfolio has grown by <span className="text-emerald-600 font-bold bg-emerald-100 px-2 py-0.5 rounded-md">12.4%</span>
              <span className="inline-flex items-center gap-1.5 ml-2 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full border border-orange-200 text-xs font-bold font-headline text-slate-800 shadow-sm">
                <motion.span 
                  animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  className="text-orange-500 inline-block drop-shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                >
                  🔥
                </motion.span>
                12 Day Streak
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2.5 bg-white/70 backdrop-blur-md border border-white text-slate-700 text-sm font-bold rounded-xl hover:bg-white shadow-sm transition-all hidden sm:block outline-none cursor-pointer text-center ring-2 ring-transparent focus:ring-emerald-400"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button 
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 text-sm font-bold rounded-xl hover:shadow-xl hover:-translate-y-0.5 transition-all outline-none border-none cursor-pointer"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* AI Insights Strip (Moved to top) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ boxShadow: '0 20px 40px -10px rgba(168, 85, 247, 0.25)' }}
          className="bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 p-6 sm:p-8 rounded-[2rem] border border-fuchsia-100 shadow-xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-stretch gap-8 transition-shadow duration-500"
        >
          <div className="flex md:flex-col items-center md:items-start md:justify-center gap-4 shrink-0 md:pr-8 md:border-r border-fuchsia-200/50">
            <div className="bg-gradient-to-br from-fuchsia-500 to-purple-600 p-3.5 rounded-2xl text-white shadow-lg shadow-fuchsia-500/30">
              <Lightbulb size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-headline text-slate-800">AI Insights</h2>
              <p className="text-xs text-fuchsia-600 uppercase tracking-[0.2em] font-bold hidden md:block mt-2">Smart Alerts</p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            <div className="p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group">
              <p className="text-xs font-black text-emerald-600 mb-2 tracking-wider uppercase group-hover:text-emerald-500 transition-colors">Savings Opportunity</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">Reducing dining out by 15% could add <span className="text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded">$450</span> to your Yearly Savings Fund.</p>
            </div>
            <div className="p-5 bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-sm hover:shadow-md hover:border-violet-200 transition-all group">
              <p className="text-xs font-black text-violet-600 mb-2 tracking-wider uppercase group-hover:text-violet-500 transition-colors">Investment Alert</p>
              <p className="text-sm text-slate-700 leading-relaxed font-medium">AAPL has reached your buy trigger of <span className="text-violet-700 font-extrabold bg-violet-100 px-1.5 py-0.5 rounded">$185</span>. Review your trade plan.</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8">
          {/* TopStatCards */}
          <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard 
              title="Total Balance" 
              amount={stats.totalBalance} 
              icon={Wallet} 
              trend={3.2} 
              trendText="+3.2% vs baseline"
              colorClass={{ bgGrad: 'bg-gradient-to-br from-indigo-50/90 to-blue-100/90', iconBg: 'bg-white', text: 'text-indigo-600', textMuted: 'text-indigo-500/80', textHeading: 'text-indigo-950', border: 'border-white' }}
              delay={0.1}
              currencySymbol={currencySymbol}
            />
            <StatCard 
              title="Overview Income" 
              amount={stats.income} 
              icon={Banknote} 
              trend={stats.incomeTrend} 
              trendText={stats.incomeTrend === 0 ? "On track" : `${Math.abs(stats.incomeTrend).toFixed(1)}% ${stats.incomeTrend > 0 ? 'above' : 'below'}`}
              colorClass={{ bgGrad: 'bg-gradient-to-br from-emerald-50/90 to-teal-100/90', iconBg: 'bg-white', text: 'text-emerald-600', textMuted: 'text-emerald-500/80', textHeading: 'text-emerald-950', border: 'border-white' }}
              delay={0.2}
              currencySymbol={currencySymbol}
            />
            <StatCard 
              title="Overview Expenses" 
              amount={stats.expenses} 
              icon={ShoppingCart} 
              trend={stats.expenseTrend} 
              trendText={stats.expenseTrend === 0 ? "On track" : `${Math.abs(stats.expenseTrend).toFixed(1)}% ${stats.expenseTrend > 0 ? 'higher' : 'lower'}`}
              colorClass={{ bgGrad: 'bg-gradient-to-br from-rose-50/90 to-red-100/90', iconBg: 'bg-white', text: 'text-rose-600', textMuted: 'text-rose-500/80', textHeading: 'text-rose-950', border: 'border-white' }}
              delay={0.3}
              currencySymbol={currencySymbol}
            />
            <StatCard 
              title="Total Savings" 
              amount={stats.totalSavings} 
              icon={PiggyBank} 
              trend={stats.savingsTrend} 
              trendText={`${stats.savingsTrend.toFixed(1)}% of goals`}
              colorClass={{ bgGrad: 'bg-gradient-to-br from-amber-50/90 to-orange-100/90', iconBg: 'bg-white', text: 'text-amber-600', textMuted: 'text-amber-500/80', textHeading: 'text-amber-950', border: 'border-white' }}
              delay={0.4}
              currencySymbol={currencySymbol}
            />
          </div>

          {/* MainChart: Balance History */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="xl:col-span-7 bg-white/60 backdrop-blur-2xl border border-white shadow-xl p-6 sm:p-8 rounded-[2rem] relative overflow-hidden group flex flex-col"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-black font-headline text-slate-800">Balance History</h2>
                <p className="text-sm font-medium text-slate-500 mt-1">Asset performance over the period</p>
              </div>
              <div className="flex gap-2 items-center bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
                <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                <span className="text-xs font-bold text-slate-600">Portfolio Value</span>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[220px]">
               <MonthlyTrendsChart transactions={filteredTransactions} timeRange={timeRange} />
            </div>
          </motion.div>
        </div>

        {/* MiddleSection: Income vs Expenses & Expense Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6">
          <div className="lg:col-span-8 bg-white/60 backdrop-blur-2xl border border-white shadow-xl p-5 sm:p-6 rounded-[2rem]">
            <h2 className="text-xl font-black font-headline text-slate-800 mb-1">Income vs Expenses</h2>
            <p className="text-xs font-medium text-slate-500 mb-4">Cashflow comparison</p>
            <div className="h-56 sm:h-60 w-full">
              <IncomeExpenseChart transactions={filteredTransactions} timeRange={timeRange} />
            </div>
          </div>

          <div className="lg:col-span-4 bg-gradient-to-br from-white/70 to-blue-50/50 backdrop-blur-2xl border border-white shadow-xl p-5 sm:p-6 rounded-[2rem] flex flex-col">
            <h2 className="text-xl font-black font-headline text-slate-800 mb-1">Expense Breakdown</h2>
            <p className="text-xs font-medium text-slate-500 mb-4">Budget utilization</p>
            <div className="flex justify-center mb-6 relative mt-1">
              {(() => {
                const totalLimit = (budgets || []).reduce((sum, b) => sum + (b.limit || 0), 0);
                const totalSpent = (budgets || []).reduce((sum, b) => sum + (b.spent || 0), 0);
                const utilizedPercent = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;
                const isOverBudget = utilizedPercent > 90;
                
                // SVG calculations
                const radius = 80;
                const circumference = 2 * Math.PI * radius;
                const strokeDashoffset = circumference - ((Math.min(utilizedPercent, 100) / 100) * circumference);

                return (
                  <motion.div 
                    animate={isOverBudget ? { scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] } : {}}
                    transition={isOverBudget ? { duration: 0.8, repeat: Infinity, ease: "easeInOut" } : {}}
                    className="relative w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center"
                  >
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                      {/* Background Track */}
                      <circle cx="100" cy="100" r={radius} fill="none" className="stroke-slate-200" strokeWidth="18" />
                      
                      {/* Animated Progress Arc */}
                      <motion.circle 
                        cx="100" cy="100" r={radius} fill="none" 
                        stroke={isOverBudget ? "#f43f5e" : "#8b5cf6"}
                        strokeWidth="18"
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className={isOverBudget ? "drop-shadow-[0_0_12px_rgba(244,63,94,0.5)]" : "drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"}
                        strokeDasharray={circumference}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className={`text-3xl font-black font-headline ${isOverBudget ? 'text-rose-500' : 'text-slate-800'}`}>
                        {utilizedPercent}%
                      </p>
                      <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-0.5">Used</p>
                    </div>
                  </motion.div>
                );
              })()}
            </div>
            
            <div className="space-y-2.5 flex-1">
              {(() => {
                const totalSpent = (budgets || []).reduce((sum, b) => sum + (b.spent || 0), 0);
                const colors = ['bg-indigo-500', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400', 'bg-cyan-400'];
                return (budgets || []).map((b, i) => (
                  <div key={b.id || b.category} className="flex justify-between items-center text-xs sm:text-sm p-2.5 bg-white/50 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-2.5">
                       <div className={`h-2.5 w-2.5 rounded-full shadow-sm ${colors[i % colors.length]}`}></div>
                       <span className="text-slate-700 font-semibold">{b.category}</span>
                    </div>
                    <span className="font-extrabold text-slate-800 bg-white px-2 py-0.5 rounded shadow-sm">
                      {totalSpent > 0 ? Math.round((b.spent / totalSpent) * 100) : 0}%
                    </span>
                  </div>
                ));
              })()}
              {(budgets || []).length === 0 && <div className="text-center text-slate-500 text-[10px] sm:text-xs py-4 font-medium italic bg-white/50 rounded-xl border border-dashed border-slate-300">Set up budgets to track distribution.</div>}
            </div>
          </div>
        </div>

        {/* BottomSection: Recent Activity */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white shadow-xl rounded-[2rem] p-5 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-black font-headline text-slate-800">Recent Activity</h2>
              <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">Latest transactions across accounts</p>
            </div>
            <button className="text-xs sm:text-sm text-indigo-600 font-bold hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-colors cursor-pointer shadow-sm" onClick={() => window.location.href = '/transactions'}>View All</button>
          </div>
          
          <div className="overflow-hidden space-y-2.5 mt-2">
            {recentTxs.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-white/50 hover:bg-white border border-transparent hover:border-slate-100 shadow-sm hover:shadow-md transition-all rounded-2xl group">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 flex shrink-0 items-center justify-center rounded-xl shadow-inner ${
                    tx.type === 'income' ? 'bg-gradient-to-br from-emerald-100 to-teal-50 text-emerald-600' : 'bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600'
                  }`}>
                    {tx.type === 'income' ? <Briefcase size={22} className="group-hover:scale-110 transition-transform"/> : <ShoppingBag size={22} className="group-hover:scale-110 transition-transform" />}
                  </div>
                  <div>
                    <p className="text-base font-bold text-slate-800 truncate max-w-[150px] sm:max-w-[400px]">{tx.name}</p>
                    <p className="text-xs font-medium text-slate-500 mt-0.5"><span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 mr-2">{tx.category}</span> {new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Completed</p>
                </div>
              </div>
            ))}
            {recentTxs.length === 0 && (
              <div className="py-12 bg-white/50 rounded-2xl border border-dashed border-slate-300 text-center flex flex-col items-center justify-center">
                <Wallet className="text-slate-300 mb-3" size={32} />
                <p className="text-slate-500 font-bold">No recent activity</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default Dashboard;
