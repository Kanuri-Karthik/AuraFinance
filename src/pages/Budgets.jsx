import { useState, useMemo } from 'react';
import { PlusCircle, Lightbulb, Edit, Trash2, ShieldAlert, ArrowRight, CheckCircle, Lock, AlertTriangle, LineChart, Home, Utensils, Ticket, ShoppingBag, Plane, HandCoins, Wallet } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import Modal from '../components/UI/Modal';
import InputField from '../components/UI/InputField';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Budgets = () => {
  const { formatCurrency, currencySymbol, budgets, setBudgets } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    spent: ''
  });

  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    const reportElement = document.getElementById('budget-report');
    if (!reportElement) return;
    
    setIsExporting(true);
    try {
      // Temporarily hide actions for cleaner PDF
      const actionButtons = document.querySelectorAll('[data-export-hide="true"]');
      actionButtons.forEach(btn => btn.style.display = 'none');

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0b1326', // Use the brand dark background
        windowWidth: 1400 // Fixed width for consistent layout in PDF
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Budget-Report-${new Date().toLocaleDateString()}.pdf`);
      
      // Restore buttons
      actionButtons.forEach(btn => btn.style.display = '');
    } catch (err) {
      console.error("Failed to export budget PDF", err);
      alert("There was an error generating the PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleOpenModal = (b = null) => {
    if (b) {
      setCurrentBudget(b);
      setFormData({
        category: b.category,
        limit: b.limit.toString(),
        spent: b.spent.toString()
      });
    } else {
      setCurrentBudget(null);
      setFormData({
        category: '',
        limit: '',
        spent: '0'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.category || !formData.limit || !formData.spent) return;
    
    const newBudget = {
      id: currentBudget ? currentBudget.id : Date.now(),
      category: formData.category,
      limit: parseFloat(formData.limit),
      spent: parseFloat(formData.spent)
    };

    if (currentBudget) {
      setBudgets(budgets.map(b => b.id === newBudget.id ? newBudget : b));
    } else {
      setBudgets([...budgets, newBudget]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setBudgets(budgets.filter(b => b.id !== id));
  };

  // Derived stats
  const totalLimit = useMemo(() => budgets.reduce((acc, b) => acc + b.limit, 0), [budgets]);
  const totalSpent = useMemo(() => budgets.reduce((acc, b) => acc + b.spent, 0), [budgets]);
  const totalProgress = totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0;
  const utilizedPercent = Math.round(totalProgress);
  const safeToSpend = Math.max(0, totalLimit - totalSpent);
  
  // Predict projected end based on current day of month (simplified)
  const currentDay = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const dailyAverage = currentDay > 0 ? (totalSpent / currentDay) : 0;
  const projectedEnd = dailyAverage * daysInMonth;

  // Icon mapping logic
  const getCategoryIcon = (category) => {
    const cat = category.toLowerCase();
    if (cat.includes('food') || cat.includes('dining')) return { Icon: Utensils, text: 'text-primary', bg: 'bg-surface-container', fixedFill: false };
    if (cat.includes('rent') || cat.includes('util')) return { Icon: Home, text: 'text-secondary', bg: 'bg-surface-container', fixedFill: true };
    if (cat.includes('entertainment') || cat.includes('fun')) return { Icon: Ticket, text: 'text-tertiary-container', bg: 'bg-tertiary-container/10', fixedFill: false };
    if (cat.includes('shop')) return { Icon: ShoppingBag, text: 'text-error', bg: 'bg-error/10', fixedFill: false };
    if (cat.includes('travel')) return { Icon: Plane, text: 'text-primary', bg: 'bg-surface-container', fixedFill: false };
    if (cat.includes('saving')) return { Icon: HandCoins, text: 'text-primary-fixed', bg: 'bg-surface-container', fixedFill: false };
    // fallback
    return { Icon: Wallet, text: 'text-on-surface', bg: 'bg-surface-container', fixedFill: false };
  };

  return (
    <div id="budget-report" className="space-y-6 pb-24 md:pb-6 relative font-body max-w-7xl mx-auto p-8">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10 pointer-events-none"></div>
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div>
          <h2 className="text-4xl font-black font-headline text-slate-800 tracking-tight mb-2">Budgets</h2>
          <p className="text-slate-500 font-bold tracking-wide">Manage and monitor your monthly financial caps.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold shadow-md shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 border border-indigo-400"
        >
          <PlusCircle size={20} />
          <span>Create Budget</span>
        </button>
      </header>

      {/* Inline Action Bar (Stats & Export) */}
      <div className="mb-8 bg-white/60 backdrop-blur-2xl border border-white px-6 py-4 rounded-3xl flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4 sm:gap-8 overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="w-3 h-3 rounded-full bg-indigo-500 border border-indigo-200 shadow-sm"></div>
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest font-headline">On Budget</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="w-3 h-3 rounded-full bg-orange-400 border border-orange-200 shadow-sm"></div>
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest font-headline">Warning</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="w-3 h-3 rounded-full bg-rose-500 border border-rose-200 shadow-sm"></div>
            <span className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-widest font-headline">Over Limit</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 sm:ml-auto">
          <div className="hidden sm:block w-[2px] h-6 bg-slate-200/50"></div>
          <button 
            onClick={handleExportPDF} 
            disabled={isExporting}
            className="text-xs font-black text-indigo-700 hover:text-indigo-800 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2 bg-white px-5 py-2.5 rounded-xl shadow-sm border border-white hover:shadow-md uppercase tracking-wider"
          >
            {isExporting ? 'Generating...' : 'Export Report'}
          </button>
        </div>
      </div>

      {/* Summary Section: Bento Style */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        {/* Large Summary Card */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-2 p-8 rounded-[2.5rem] bg-white/60 backdrop-blur-2xl border border-white shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
        >
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-1 block">Monthly Overview</span>
                <h3 className="text-4xl font-black text-slate-800 font-headline tracking-tight">{formatCurrency(totalSpent)} <span className="text-slate-400 font-bold text-xl">/ {formatCurrency(totalLimit)}</span></h3>
              </div>
              <div className="px-5 py-2 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black shadow-sm">
                {utilizedPercent}% Utilized
              </div>
            </div>
            
            {/* Progress Bar Container */}
            <div className="relative h-6 w-full bg-white border border-white rounded-full overflow-hidden shadow-sm mb-8">
              <div 
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r 
                  ${utilizedPercent > 90 ? 'from-[#fbbf24] to-rose-500' : 'from-indigo-500 via-sky-400 to-[#6ffbbe]'}
                `}
                style={{ width: `${totalProgress}%`, boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
              ></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Daily Average</p>
                <p className="text-lg font-black text-slate-800 font-headline">{formatCurrency(dailyAverage)}</p>
              </div>
              <div className="space-y-1 border-l-2 border-slate-200/50 pl-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Projected End</p>
                <p className="text-lg font-black text-slate-800 font-headline">{formatCurrency(projectedEnd)}</p>
              </div>
              <div className="space-y-1 border-l-2 border-slate-200/50 pl-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Safe to Spend</p>
                <p className="text-lg font-black font-headline text-emerald-500">{formatCurrency(safeToSpend)}</p>
              </div>
            </div>
            </div>
          </motion.div>
        
        {/* Side Card: Insights */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="p-8 rounded-[2.5rem] bg-gradient-to-br from-indigo-50 to-white/60 backdrop-blur-2xl border border-white shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
        >
          <div>
            <Lightbulb className="text-indigo-500 mb-6 drop-shadow-sm" size={36} strokeWidth={2.5} />
            <h4 className="text-2xl font-black font-headline mb-3 text-slate-800">Spending Insight</h4>
            <p className="text-sm text-slate-500 font-bold leading-relaxed">Your "Dining & Entertainment" is trending 15% higher than last month. Consider reducing weekend spend.</p>
          </div>
          <a className="text-indigo-600 text-sm font-black flex items-center gap-2 hover:gap-3 transition-all mt-6 cursor-pointer" onClick={(e) => { e.preventDefault(); window.location.href='/reports'; }}>
            View detailed analytics <ArrowRight size={18} strokeWidth={3} />
          </a>
        </motion.div>
      </section>

      {/* Category Grid */}
      <h3 className="text-2xl font-black font-headline mb-8 px-2 text-slate-800">Category Breakdown</h3>
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {budgets.map((b) => {
            const percentage = b.limit > 0 ? (b.spent / b.limit) * 100 : 0;
            const displayPercentage = Math.min(percentage, 100);
            const isDanger = percentage >= 100;
            const isWarning = percentage >= 85 && percentage < 100;
            
            const { Icon, text, bg, fixedFill } = getCategoryIcon(b.category);
            
            let cardClasses = "group relative p-6 rounded-3xl transition-all duration-300 shadow-sm border border-white hover:shadow-md ";
            let barClasses = "h-full rounded-full transition-all duration-700 ";
            let statusIcon = null;
            let statusText = "";
            let statusColor = "";

            if (isDanger && !fixedFill) {
              cardClasses += "bg-rose-50/80 backdrop-blur-2xl";
              barClasses += "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]";
              statusIcon = <AlertTriangle size={15} strokeWidth={3} className="text-rose-500" />;
              statusText = "Limit Exceeded";
              statusColor = "text-rose-600";
            } else if (isWarning && !fixedFill) {
              cardClasses += "bg-orange-50/80 backdrop-blur-2xl";
              barClasses += "bg-orange-400 shadow-[0_0_12px_rgba(251,146,60,0.4)]";
              statusIcon = <ShieldAlert size={15} strokeWidth={3} className="text-orange-500" />;
              statusText = "Danger Zone";
              statusColor = "text-orange-600";
            } else {
              cardClasses += "bg-white/60 backdrop-blur-2xl hover:bg-white/80";
              barClasses += fixedFill ? "bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.4)]" : "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]";
              statusIcon = fixedFill ? <Lock size={15} strokeWidth={3} className="text-slate-400" /> : <CheckCircle size={15} strokeWidth={3} className="text-emerald-500" />;
              statusText = fixedFill ? "Closed for month" : "On Track";
              statusColor = fixedFill ? "text-slate-400" : "text-emerald-600";
            }

            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={b.id}
                className={cardClasses}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-3xl flex items-center justify-center bg-white border border-white shadow-sm`}>
                    <Icon className="text-indigo-500" size={28} strokeWidth={2.5}/>
                  </div>
                  <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity" data-export-hide="true">
                    <button 
                      onClick={() => handleOpenModal(b)}
                      className="p-2.5 rounded-xl bg-white shadow-sm border border-white hover:border-indigo-200 text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <Edit size={20} />
                    </button>
                    <button 
                      onClick={() => handleDelete(b.id)}
                      className="p-2.5 rounded-xl bg-white shadow-sm border border-white hover:border-rose-200 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
                
                <h4 className={`text-xl font-black tracking-tight font-headline mb-1 ${isDanger && !fixedFill ? 'text-rose-600' : isWarning ? 'text-orange-600' : 'text-slate-800'}`}>
                  {b.category}
                </h4>
                
                <div className="flex justify-between items-end mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-3xl font-black tracking-tight font-headline ${isDanger && !fixedFill ? 'text-rose-600' : 'text-slate-800'}`}>
                      {formatCurrency(b.spent)}
                    </span>
                    <span className="text-sm font-bold text-slate-400">/ {formatCurrency(b.limit)}</span>
                  </div>
                  <span className={`text-xs font-black ${isDanger && !fixedFill ? 'text-rose-600 uppercase' : fixedFill ? 'text-slate-400' : isWarning ? 'text-orange-500' : 'text-emerald-500'}`}>
                    {isDanger && !fixedFill ? `OVER ${formatCurrency(b.spent - b.limit)}` : fixedFill ? 'Fixed' : `${(100 - percentage).toFixed(0)}% Left`}
                  </span>
                </div>
                
                <div className="h-3 w-full bg-white border border-white rounded-full overflow-hidden mb-4 shadow-sm">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${displayPercentage}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={barClasses}
                  ></motion.div>
                </div>
                
                <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-black ${statusColor}`}>
                  {statusIcon}
                  {statusText}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </section>



       {/* Add / Edit Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentBudget ? "Edit Category Budget" : "Create Category Budget"}
      >
        <div className="space-y-4">
          <InputField 
            label="Category Name" 
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <InputField 
              label={`Monthly Limit (${currencySymbol})`} 
              type="number"
              step="1"
              value={formData.limit}
              onChange={(e) => setFormData({...formData, limit: e.target.value})}
            />
            <InputField 
              label={`Currently Spent (${currencySymbol})`} 
              type="number"
              step="0.01"
              value={formData.spent}
              onChange={(e) => setFormData({...formData, spent: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
             className="px-5 py-2.5 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
             onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button 
             className="px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold rounded-2xl hover:-translate-y-0.5 active:scale-95 transition-all shadow-md shadow-indigo-200 border border-indigo-400"
             onClick={handleSave}
          >
            {currentBudget ? "Save Changes" : "Create Budget"}
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Budgets;
