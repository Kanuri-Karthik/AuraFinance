import { useState, useMemo } from 'react';
import { 
  FileText, Download, TrendingUp, DollarSign, Lightbulb, Sparkles, 
  PiggyBank, ShieldAlert, ShieldCheck, PieChart, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Stubbed Datasets based on Timeframe ---
const dataWeekly = {
  trend: [
    { name: 'Mon', income: 400, expense: 240 },
    { name: 'Tue', income: 300, expense: 139 },
    { name: 'Wed', income: 200, expense: 980 },
    { name: 'Thu', income: 278, expense: 390 },
    { name: 'Fri', income: 189, expense: 480 },
    { name: 'Sat', income: 239, expense: 380 },
    { name: 'Sun', income: 349, expense: 430 },
  ],
  categories: [
    { name: 'Food', amount: 300, max: 500 },
    { name: 'Transport', amount: 120, max: 500 },
    { name: 'Shopping', amount: 250, max: 500 },
    { name: 'Bills', amount: 180, max: 500 },
  ],
  insights: [
    { title: 'Spending Alert', desc: "Your expenses spiked on Wednesday by 40% compared to average.", icon: ShieldAlert, color: 'text-tertiary-container', bg: 'bg-tertiary-container/10' },
    { title: 'Category Insight', desc: "Food is your top spending category this week.", icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10' }
  ]
};

const dataMonthly = {
  trend: [
    { name: 'Week 1', income: 1400, expense: 1240 },
    { name: 'Week 2', income: 1300, expense: 939 },
    { name: 'Week 3', income: 2200, expense: 1980 },
    { name: 'Week 4', income: 2780, expense: 1390 },
  ],
  categories: [
    { name: 'Housing', amount: 1500, max: 2000 },
    { name: 'Food', amount: 800, max: 2000 },
    { name: 'Transport', amount: 320, max: 2000 },
    { name: 'Shopping', amount: 650, max: 2000 },
  ],
  insights: [
    { title: 'Saving Potential', desc: "Redirecting your weekend dining surplus to your savings could yield $1.2k by year-end.", icon: PiggyBank, color: 'text-secondary', bg: 'bg-secondary/20' },
    { title: 'Subscription Optimization', desc: "We found 3 recurring subscriptions ($42/mo) that haven't been used in 90 days.", icon: Lightbulb, color: 'text-primary', bg: 'bg-primary/10' }
  ]
};

const dataYearly = {
  trend: [
    { name: 'Jan', income: 5400, expense: 4240 },
    { name: 'Feb', income: 5300, expense: 3939 },
    { name: 'Mar', income: 6200, expense: 4980 },
    { name: 'Apr', income: 5780, expense: 4390 },
    { name: 'May', income: 5189, expense: 3480 },
    { name: 'Jun', income: 6239, expense: 5380 },
    { name: 'Jul', income: 5349, expense: 4430 },
    { name: 'Aug', income: 5800, expense: 4200 },
    { name: 'Sep', income: 5900, expense: 4800 },
    { name: 'Oct', income: 6100, expense: 5100 },
    { name: 'Nov', income: 6500, expense: 5800 },
    { name: 'Dec', income: 8200, expense: 6200 },
  ],
  categories: [
    { name: 'Housing', amount: 18000, max: 20000 },
    { name: 'Food', amount: 8500, max: 20000 },
    { name: 'Transport', amount: 4200, max: 20000 },
    { name: 'Shopping', amount: 7800, max: 20000 },
  ],
  insights: [
    { title: 'Income Milestone', desc: "December was your highest earning month due to holiday bonuses.", icon: TrendingUp, color: 'text-primary', bg: 'bg-primary/10' },
    { title: 'Savings Rate', desc: "Your average monthly savings rate this year is roughly 18%.", icon: PiggyBank, color: 'text-secondary', bg: 'bg-secondary/20' }
  ]
};

const mapData = {
  'Weekly': dataWeekly,
  'Monthly': dataMonthly,
  'Yearly': dataYearly
};

// Custom Chart Tooltips
const CustomTrendTooltip = ({ active, payload, label }) => {
  const { formatCurrency } = useFinance();
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl shadow-xl">
        <p className="text-slate-800 font-headline font-black tracking-tight mb-3">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-6 mb-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color }} />
              <span className="text-slate-500 text-sm capitalize font-bold">{entry.name}</span>
            </div>
            <span className="text-slate-800 font-black text-sm ml-auto">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};


const Reports = () => {
  const { formatCurrency, currencySymbol } = useFinance();
  const [timeframe, setTimeframe] = useState('Monthly');
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const currentData = mapData[timeframe];
  
  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    currentData.trend.forEach(t => {
      income += t.income;
      expense += t.expense;
    });
    return { income, expense, net: income - expense };
  }, [currentData]);

  const handleExport = async (type) => {
    if (type === 'CSV') {
      const headers = ['Name', 'Income', 'Expense', 'Net'];
      const rows = currentData.trend.map(t => [
        t.name,
        t.income,
        t.expense,
        t.income - t.expense
      ]);
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analytics-${timeframe}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (type === 'PDF') {
      const reportElement = document.getElementById('report-content');
      if (!reportElement) return;
      
      setIsExportingPDF(true);
      try {
        const canvas = await html2canvas(reportElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#f8fafc' // background color from Tailwind config
        });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'l' : 'p',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Analytics-${timeframe}.pdf`);
      } catch (err) {
        console.error("Failed to export PDF", err);
        alert("There was an error generating the PDF.");
      } finally {
        setIsExportingPDF(false);
      }
    }
  };

  return (
    <div id="report-content" className="pb-10 font-body max-w-7xl mx-auto">
      
      {/* Scroll View 1: Main Analytics */}
      <section className="flex flex-col pt-4">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-4xl font-black font-headline tracking-tight text-slate-800 mb-2">Analytics & Reports</h1>
            <p className="text-slate-500 font-bold">Comprehensive breakdown of your financial ecosystem.</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Timeframe Toggles */}
            <div className="flex bg-white/60 backdrop-blur-md shadow-sm border border-white p-1.5 rounded-2xl">
              {['Weekly', 'Monthly', 'Yearly'].map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-5 py-2.5 text-sm font-black rounded-xl transition-all ${
                    timeframe === tf 
                      ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            {/* Actions */}
            <div className="flex gap-2" data-html2canvas-ignore="true">
              <button 
                onClick={() => handleExport('CSV')}
                className="flex items-center gap-2 px-5 py-2.5 bg-white text-slate-700 rounded-2xl shadow-sm hover:shadow-md border border-white transition-all"
              >
                <Download size={18} strokeWidth={2.5}/>
                <span className="text-sm font-black">CSV</span>
              </button>
              <button 
                onClick={() => handleExport('PDF')}
                disabled={isExportingPDF}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-indigo-200 border border-indigo-400 disabled:opacity-50"
              >
                <FileText size={18} strokeWidth={2.5}/>
                <span className="text-sm font-black">{isExportingPDF ? 'Wait...' : 'PDF'}</span>
              </button>
            </div>
          </div>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <AnimatePresence mode="popLayout">
            <motion.div key={timeframe + "inc"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Income</p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black font-headline tracking-tight text-indigo-600">{formatCurrency(totals.income)}</h3>
                <span className="text-indigo-500 text-xs font-black mb-1.5 flex items-center bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100 shadow-sm">
                  <ArrowUpRight size={14} strokeWidth={3}/> 12%
                </span>
              </div>
            </motion.div>
            
            <motion.div key={timeframe + "exp"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] border-l-4 border-rose-400 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Total Expenses</p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black font-headline tracking-tight text-rose-500">{formatCurrency(totals.expense)}</h3>
                <span className="text-rose-600 text-xs font-black mb-1.5 flex items-center bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100 shadow-sm">
                   <ArrowUpRight size={14} strokeWidth={3}/> 4%
                </span>
              </div>
            </motion.div>
            
            <motion.div key={timeframe + "net"} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] border-l-4 border-emerald-400 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Net Savings</p>
              <div className="flex items-end gap-2">
                <h3 className="text-4xl font-black font-headline tracking-tight text-emerald-500">{formatCurrency(totals.net)}</h3>
                <span className="bg-emerald-50 text-emerald-600 text-[10px] px-2.5 py-1 rounded-lg font-black mb-1.5 border border-emerald-200 shadow-sm">HEALTHY</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Major Visualization Row */}
        <div className="grid grid-cols-12 gap-6 flex-1">
          {/* Main Chart: Area Trend */}
          <div className="col-span-12 lg:col-span-8 bg-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] relative overflow-hidden shadow-sm flex flex-col border border-white hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black font-headline tracking-tight text-slate-800">Income vs Expenses Trend</h2>
              <div className="flex gap-4 text-[10px] uppercase tracking-widest font-black">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-sm border border-indigo-100"></span> Income
                </div>
                <div className="flex items-center gap-2 text-rose-600">
                  <span className="w-3 h-3 rounded-full bg-rose-400 shadow-sm border border-rose-100"></span> Expenses
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full relative min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={currentData.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '800', fontFamily: 'inherit' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: '800', fontFamily: 'inherit' }}
                      tickFormatter={(value) => `${currencySymbol}${value >= 1000 ? (value / 1000) + 'k' : value}`}
                    />
                    <RechartsTooltip content={<CustomTrendTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    
                    <Area 
                      type="monotone" 
                      dataKey="income" 
                      name="Income"
                      stroke="#6366f1" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorIncome)" 
                      activeDot={{ r: 6, fill: '#6366f1', strokeWidth: 0, shadow: '0 0 10px rgba(99,102,241,0.5)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="expense" 
                      name="Expenses"
                      stroke="#f43f5e" 
                      strokeDasharray="8 4"
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorExpense)" 
                      activeDot={{ r: 6, fill: '#f43f5e', strokeWidth: 0 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
            </div>
          </div>

          {/* Side Section: AI Insights */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-black tracking-tight font-headline text-slate-800 flex items-center gap-3">
              <Sparkles className="text-indigo-500" size={28} strokeWidth={2.5} />
              Smart AI Insights
            </h2>
            
            <AnimatePresence mode="wait">
              <motion.div key={timeframe + "ins"} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                {currentData.insights.map((insight, idx) => {
                  return (
                    <div key={idx} className="bg-white/60 backdrop-blur-xl border border-white p-5 rounded-3xl flex gap-4 hover:-translate-y-1 transition-all cursor-default shadow-sm hover:shadow-md">
                      <div className={`w-12 h-12 shrink-0 ${insight.bg} rounded-2xl flex items-center justify-center ${insight.color} shadow-sm border border-white`}>
                        <insight.icon size={24} strokeWidth={2.5}/>
                      </div>
                      <div>
                        <p className="text-base font-black text-slate-800 mb-1">{insight.title}</p>
                        <p className="text-xs text-slate-500 font-bold leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
      
      {/* Viewport Spacing (Forces Section 2 to a fresh scroll) */}
      <div className="h-6 lg:h-8"></div>

      {/* Scroll View 2: Breakdown & Secondary Metrics */}
      <section className="space-y-6">

          {/* Top Categories Spend */}
          <div className="col-span-12 bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-white hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-black tracking-tight font-headline text-slate-800 mb-6">Top Categories Spend</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {currentData.categories.map((cat, i) => {
                const percentage = (cat.amount / cat.max) * 100;
                return (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-sm font-black mb-1">
                      <span className="text-slate-800 font-headline uppercase tracking-widest">{cat.name}</span>
                      <span className="text-slate-500">{formatCurrency(cat.amount)}</span>
                    </div>
                    <div className="w-full bg-white border border-slate-100 h-3.5 rounded-full overflow-hidden shadow-sm">
                      <motion.div 
                        className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full rounded-full" 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      ></motion.div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Data Visualization: Small Bento Items */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-4 bg-white/60 backdrop-blur-2xl p-6 sm:p-8 rounded-[2.5rem] border border-white shadow-sm hover:shadow-md transition-shadow">
              <h4 className="text-sm font-black font-headline uppercase tracking-widest text-slate-500 mb-8">Investment Distribution</h4>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 36 36">
                    {/* Background Ring */}
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeDasharray="100, 100" strokeWidth="5"></path>
                    {/* Equities (65%) */}
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6366f1" strokeDasharray="65, 100" strokeWidth="5"></path>
                    {/* Bonds (25%) */}
                    <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#38bdf8" strokeDasharray="25, 100" strokeDashoffset="-65" strokeWidth="5"></path>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-black font-headline tracking-widest text-slate-400">CORE</span>
                    <span className="text-xl font-black text-slate-800 tracking-tight">STOCKS</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <span className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_5px_rgba(99,102,241,0.5)] border border-indigo-100"></span>
                    <span className="text-slate-600">Equities (65%)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <span className="w-3 h-3 rounded-full bg-sky-400 shadow-[0_0_5px_rgba(56,189,248,0.5)] border border-sky-100"></span>
                    <span className="text-slate-600">Bonds (25%)</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                    <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300"></span>
                    <span className="text-slate-600">Cash (10%)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8 bg-gradient-to-r from-indigo-50 to-white/60 backdrop-blur-2xl p-8 rounded-[2.5rem] flex items-center justify-between border border-white relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
              <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 rounded-3xl bg-white border border-white flex items-center justify-center text-indigo-500 shadow-sm">
                  <ShieldCheck size={32} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className="text-2xl font-black tracking-tight font-headline text-slate-800 mb-1">Financial Health Score</h4>
                  <p className="text-sm font-bold text-slate-500">You are in the top 5% of users with similar income.</p>
                </div>
              </div>
              <div className="text-right relative z-10">
                <span className="text-6xl font-black tracking-tighter font-headline text-indigo-600 drop-shadow-sm">842</span>
                <span className="block text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-2 bg-white px-2 py-1 rounded-lg border border-indigo-100 shadow-sm w-max ml-auto">EXCELLENT</span>
              </div>
            </div>
          </div>
      </section>
    </div>
  );
};

export default Reports;
