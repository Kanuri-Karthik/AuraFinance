import { useState, useMemo } from 'react';
import { Plus, Trophy, PlaneTakeoff, Building, Edit, Trash2, ShieldCheck, Lock, Clock, ArrowRight, Home, Sparkles, AlertCircle } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { useNotification } from '../context/NotificationContext';
import Modal from '../components/UI/Modal';
import InputField from '../components/UI/InputField';
import { motion, AnimatePresence } from 'framer-motion';

const Goals = () => {
  const { formatCurrency, currencySymbol, goals, setGoals, transactions } = useFinance();
  const { addNotification } = useNotification();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [momentumRange, setMomentumRange] = useState(6);

  const momentumData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = momentumRange - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: d.toLocaleString('en-US', { month: 'short' }).toUpperCase(),
        month: d.getMonth(),
        year: d.getFullYear(),
        savings: 0
      });
    }

    (transactions || []).forEach(tx => {
      if (tx.isTransfer) return;
      
      const txDate = new Date(tx.date);
      if (isNaN(txDate.getTime())) return;

      const txMonth = txDate.getMonth();
      const txYear = txDate.getFullYear();

      const monthData = months.find(m => m.month === txMonth && m.year === txYear);
      if (monthData) {
        if (tx.type === 'income') monthData.savings += Math.abs(tx.amount);
        if (tx.type === 'expense') monthData.savings -= Math.abs(tx.amount);
      }
    });

    const validSavings = months.map(m => Math.max(0, m.savings));
    const maxSavings = Math.max(...validSavings, 100); 

    return months.map((m, idx) => {
      let percentage = (validSavings[idx] / maxSavings) * 100;
      if (validSavings[idx] === 0) percentage = 2; // tiny visual indicator
      return {
        ...m,
        percentage,
        savings: validSavings[idx]
      };
    });
  }, [transactions, momentumRange]);
  const [isOptimizationModalOpen, setIsOptimizationModalOpen] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    saved: '',
    deadline: ''
  });

  // Optimization Modal State
  const optimizedAmount = 450;
  const incompleteGoals = goals.filter(g => g.saved < g.target);
  const suggestedGoal = incompleteGoals.sort((a,b) => (b.saved/b.target) - (a.saved/a.target))[0];
  const [optGoalId, setOptGoalId] = useState(suggestedGoal?.id || '');

  const handleOpenModal = (g = null) => {
    if (g) {
      setCurrentGoal(g);
      setFormData({
        name: g.name,
        target: g.target.toString(),
        saved: g.saved.toString(),
        deadline: g.deadline
      });
    } else {
      setCurrentGoal(null);
      setFormData({
        name: '',
        target: '',
        saved: '0',
        deadline: new Date().toISOString().split('T')[0]
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.target || !formData.deadline) return;
    
    const newGoal = {
      id: currentGoal ? currentGoal.id : Date.now(),
      name: formData.name,
      target: parseFloat(formData.target),
      saved: parseFloat(formData.saved || 0),
      deadline: formData.deadline
    };

    if (currentGoal) {
      setGoals(goals.map(g => g.id === newGoal.id ? newGoal : g));
      addNotification("Goal Updated", "Your financial goal has been updated.", "success");
    } else {
      setGoals([...goals, newGoal]);
      addNotification("Goal Created", "New financial goal actively tracking.", "success");
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    setGoals(goals.filter(g => g.id !== id));
    addNotification("Goal Deleted", "The goal has been removed.", "info");
  };

  const handleApplyOptimization = () => {
    if (!optGoalId) {
      addNotification("Error", "Please select a goal to optimize.", "danger");
      return;
    }
    
    setGoals(goals.map(g => {
      if(g.id.toString() === optGoalId.toString()) {
         return { ...g, saved: g.saved + optimizedAmount };
      }
      return g;
    }));
    
    addNotification(
      "Optimization Applied \u2728", 
      `Successfully allocated ${formatCurrency(optimizedAmount)} from dining surplus!`, 
      "success"
    );
    setIsOptimizationModalOpen(false);
  };

  const getGoalTheme = (percentage, name) => {
    const isCompleted = percentage >= 100;
    const isNearCompleted = percentage >= 80 && percentage < 100;
    const lowerName = name.toLowerCase();
    
    let Icon = Building;
    if (lowerName.includes('trip') || lowerName.includes('travel') || lowerName.includes('vacation')) Icon = PlaneTakeoff;
    if (lowerName.includes('house') || lowerName.includes('home') || lowerName.includes('mortgage')) Icon = Home;
    if (lowerName.includes('emergency') || lowerName.includes('fund') || lowerName.includes('security')) Icon = ShieldCheck;
    
    if (isCompleted) return { Icon: Trophy, style: 'completed' };
    if (isNearCompleted) return { Icon, style: 'near' };
    return { Icon, style: 'active' };
  };

  return (
    <div className="space-y-6 pb-24 md:pb-6 relative font-body max-w-7xl mx-auto">
      {/* Header Section */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
        <div>
          <h2 className="text-4xl font-headline font-black text-slate-800 tracking-tight mb-2">Financial Goals</h2>
          <p className="text-slate-500 font-bold tracking-wide">Tracking your path to architectural wealth.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-headline font-bold rounded-2xl shadow-md shadow-indigo-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 transition-transform border border-indigo-400"
        >
          <Plus size={20} className="stroke-[3]" />
          New Goal
        </button>
      </header>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {goals.map((g) => {
            const percentage = g.target > 0 ? (g.saved / g.target) * 100 : 0;
            const displayPercentage = Math.min(percentage, 100);
            const { Icon, style } = getGoalTheme(percentage, g.name);
            
            const formattedDeadline = new Date(g.deadline).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

            if (style === 'completed') {
              return (
                <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={g.id}
                  className="bg-amber-50/80 backdrop-blur-2xl p-6 rounded-[2rem] border border-amber-100 relative overflow-hidden group hover:border-amber-200 transition-all shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 bg-white rounded-2xl text-amber-500 shadow-sm border border-amber-100">
                      <Icon size={28} strokeWidth={2.5} className="drop-shadow-sm" />
                    </div>
                    <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity z-10">
                      <button onClick={() => handleDelete(g.id)} className="p-2.5 rounded-xl bg-white hover:bg-rose-50 border border-white hover:border-rose-100 text-rose-500 transition-colors shadow-sm"><Trash2 size={18}/></button>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-headline font-black text-slate-800 mb-1">{g.name}</h3>
                  <p className="text-sm text-slate-500 font-bold mb-8">Completed Target</p>
                  
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Saved Amount</p>
                        <p className="text-3xl font-headline font-black tracking-tight text-amber-500">{formatCurrency(g.saved)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Goal</p>
                        <p className="text-lg font-headline font-bold text-slate-800">{formatCurrency(g.target)}</p>
                      </div>
                    </div>
                    
                    <div className="relative h-4 w-full bg-white border border-white rounded-full overflow-hidden shadow-sm">
                      <motion.div initial={{ width: 0 }} animate={{ width: `100%` }} transition={{ duration: 1 }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></motion.div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-black text-amber-600">
                      <span>100% ACHIEVED</span>
                      <span className="bg-white px-2 py-0.5 rounded-lg border border-amber-100 hidden sm:block">ARCHIVED GOAL</span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            if (style === 'near') {
              return (
                <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={g.id}
                  className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-white relative overflow-hidden group hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  <div className="flex justify-between items-start mb-6 z-10 relative">
                    <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm border border-white">
                      <Icon size={28} strokeWidth={2.5}/>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1 bg-white rounded-xl border border-white shadow-sm">Target: {formattedDeadline}</span>
                       <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(g)} className="p-2.5 rounded-xl bg-white hover:border-indigo-200 border border-transparent shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(g.id)} className="p-2.5 rounded-xl bg-white hover:border-rose-200 border border-transparent shadow-sm text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                       </div>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-headline font-black text-slate-800 mb-1 relative z-10 max-w-[90%] truncate">{g.name}</h3>
                  <p className="text-sm text-slate-500 font-bold mb-8 relative z-10">Personal Lifestyle</p>
                  
                  <div className="space-y-4 mb-8 relative z-10">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Current Progress</p>
                        <p className="text-3xl font-headline font-black tracking-tight text-indigo-600">{formatCurrency(g.saved)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Goal</p>
                        <p className="text-lg font-headline font-bold text-slate-800">{formatCurrency(g.target)}</p>
                      </div>
                    </div>
                    
                    <div className="relative h-4 w-full bg-white border border-white rounded-full overflow-hidden shadow-sm">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${displayPercentage}%` }} transition={{ duration: 1 }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"></motion.div>
                    </div>
                    
                    <div className="flex justify-between text-[10px] font-black text-slate-500">
                      <span>{displayPercentage.toFixed(1)}% COMPLETED</span>
                      <span className="text-indigo-500">+12% THIS MONTH</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-5 border-t-2 border-slate-200/50">
                    <div className="flex gap-2 items-center">
                      <Clock size={16} strokeWidth={3} className="text-emerald-500" />
                      <span className="text-[10px] text-emerald-600 uppercase font-black tracking-widest">Almost there!</span>
                    </div>
                    <button onClick={() => handleOpenModal(g)} className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest">Update Funds</button>
                  </div>
                </motion.div>
              );
            }

            // Default active
            return (
              <motion.div layout initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} key={g.id}
                className="bg-white/60 backdrop-blur-2xl p-6 rounded-[2rem] border border-white relative overflow-hidden group hover:bg-white/80 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-white rounded-2xl text-indigo-500 shadow-sm border border-white">
                    <Icon size={28} strokeWidth={2.5}/>
                  </div>
                  <div className="flex items-center gap-2">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-3 py-1 bg-white rounded-xl border border-white shadow-sm">Target: {formattedDeadline}</span>
                     <div className="flex gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(g)} className="p-2.5 rounded-xl bg-white hover:border-indigo-200 border border-transparent shadow-sm text-slate-400 hover:text-indigo-600 transition-colors"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(g.id)} className="p-2.5 rounded-xl bg-white hover:border-rose-200 border border-transparent shadow-sm text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18}/></button>
                     </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-headline font-black text-slate-800 mb-1 line-clamp-1">{g.name}</h3>
                <p className="text-sm text-slate-500 font-bold mb-8">Active Target</p>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Current Progress</p>
                      <p className="text-3xl font-headline font-black tracking-tight text-indigo-600">{formatCurrency(g.saved)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Goal</p>
                      <p className="text-lg font-headline font-bold text-slate-800">{formatCurrency(g.target)}</p>
                    </div>
                  </div>
                  
                  <div className="relative h-4 w-full bg-white border border-white shadow-sm rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${displayPercentage}%` }} transition={{ duration: 1 }} className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full"></motion.div>
                  </div>
                  
                  <div className="flex justify-between text-[10px] font-black text-slate-500">
                    <span>{displayPercentage.toFixed(1)}% COMPLETED</span>
                    <span className="text-indigo-500">+2.4% THIS MONTH</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-5 border-t-2 border-slate-200/50 hidden sm:flex">
                  <div className="flex -space-x-3">
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-100 flex items-center justify-center text-[10px] font-black text-indigo-500">M</div>
                    <div className="w-8 h-8 rounded-full border-2 border-white bg-sky-100 flex items-center justify-center text-[10px] font-black text-sky-500">Y</div>
                  </div>
                  <button onClick={() => handleOpenModal(g)} className="text-indigo-600 hover:text-indigo-800 text-xs font-black uppercase tracking-widest hidden sm:block">View Details</button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Secondary Insights (Asymmetric Bento) */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-12 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:col-span-8 bg-white/60 backdrop-blur-2xl border border-white shadow-sm p-8 rounded-[2.5rem] hover:shadow-md transition-all duration-500"
        >
          <div className="flex justify-between items-center mb-8">
            <h4 className="font-headline font-black text-2xl text-slate-800">Saving Momentum</h4>
            <select 
              value={momentumRange}
              onChange={(e) => setMomentumRange(Number(e.target.value))}
              className="bg-white border border-slate-200 text-xs font-black text-slate-600 rounded-xl px-4 py-2 focus:ring-1 focus:ring-indigo-500 outline-none cursor-pointer shadow-sm"
            >
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last Year</option>
            </select>
          </div>
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-4">
            {momentumData.map((data, idx) => {
              const isCurrentMonth = data.month === new Date().getMonth() && data.year === new Date().getFullYear();
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-4 h-full justify-end group cursor-pointer relative">
                  <div className="w-full bg-white shadow-sm border border-white rounded-[1rem] relative flex items-end justify-center" style={{ height: `${Math.max(data.percentage, 2)}%` }}>
                    <div className={`w-full rounded-[1rem] transition-all h-full ${isCurrentMonth ? 'bg-indigo-500 border-2 border-indigo-500 shadow-md' : 'bg-indigo-100 group-hover:bg-indigo-200 absolute bottom-0'}`}></div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-black py-1 px-3 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-lg">
                      {formatCurrency(data.savings)}
                    </div>
                  </div>
                  <span className={`text-[10px] font-black ${isCurrentMonth ? 'text-indigo-600' : 'text-slate-400'}`}>{data.label}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="md:col-span-4 bg-gradient-to-br from-indigo-50 to-white/60 p-8 rounded-[2.5rem] border border-white flex flex-col justify-center items-center text-center overflow-hidden relative backdrop-blur-xl transition-all duration-500 shadow-sm hover:shadow-md"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-3xl flex items-center justify-center mb-6 shadow-md shadow-indigo-200">
             <Trophy size={28} className="text-white" strokeWidth={2.5}/>
          </div>
          <h4 className="font-headline font-black text-2xl text-slate-800 mb-2">Smart Allocation</h4>
          <p className="text-sm text-slate-500 font-bold leading-relaxed mb-8">Based on your spending, you can reach your next goal 2 months earlier.</p>
          <button onClick={() => {
            if(incompleteGoals.length > 0 && !optGoalId) setOptGoalId(suggestedGoal?.id);
            setIsOptimizationModalOpen(true);
          }} className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white border border-indigo-400 rounded-2xl shadow-sm font-black text-xs uppercase tracking-widest transition-colors">Apply Optimization</button>
        </motion.div>
      </div>

       {/* Add / Edit Form Modal */}
       <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentGoal ? "Edit Goal" : "New Financial Goal"}
      >
        <div className="space-y-6">
          <InputField 
            label="Goal Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="e.g. Retirement Fund"
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField 
              label={`Target Amount (${currencySymbol})`} 
              type="number"
              step="1"
              value={formData.target}
              onChange={(e) => setFormData({...formData, target: e.target.value})}
              placeholder="0.00"
            />
            <InputField 
              label={`Initial Deposit (${currencySymbol})`} 
              type="number"
              step="0.01"
              value={formData.saved}
              onChange={(e) => setFormData({...formData, saved: e.target.value})}
              placeholder="0.00"
            />
          </div>
          
          <InputField 
            label="Target Deadline" 
            type="date"
            value={formData.deadline}
            onChange={(e) => setFormData({...formData, deadline: e.target.value})}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
             className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
             onClick={() => setIsModalOpen(false)}
          >
            Cancel
          </button>
          <button 
             className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-headline font-black rounded-2xl shadow-md border border-indigo-400 hover:-translate-y-0.5 active:scale-95 transition-transform"
             onClick={handleSave}
          >
            {currentGoal ? "Save Changes" : "Create Goal"}
          </button>
        </div>
      </Modal>

      {/* Optimization Modal */}
      <Modal 
        isOpen={isOptimizationModalOpen} 
        onClose={() => setIsOptimizationModalOpen(false)}
        title="Smart AI Optimization"
      >
        <div className="space-y-6">
          <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-3xl flex gap-4 shadow-sm">
            <div className="bg-white text-indigo-500 p-3 rounded-2xl h-fit shadow-sm border border-indigo-50">
              <Sparkles size={24} strokeWidth={2.5}/>
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 mb-1">Surplus Discovered: {formatCurrency(optimizedAmount)}</p>
              <p className="text-xs text-slate-500 font-medium leading-relaxed mb-1">
                We identified a reduction in your discretionary dining expenses this month. You can re-allocate this directly to a goal.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Target Goal</label>
            {incompleteGoals.length > 0 ? (
              <div className="space-y-2">
                {incompleteGoals.map(g => (
                  <label key={g.id} className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                    optGoalId === g.id ? 'bg-indigo-50 border-indigo-400 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        optGoalId === g.id ? 'border-indigo-600' : 'border-slate-300'
                      }`}>
                        {optGoalId === g.id && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                      </div>
                      <span className="text-sm font-bold text-slate-800">{g.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-indigo-100 shadow-sm">{((g.saved / g.target)*100).toFixed(0)}% Done</p>
                    </div>
                    {/* Invisible radio wrapper */}
                    <input type="radio" name="optGoal" value={g.id} checked={optGoalId === g.id} onChange={() => setOptGoalId(g.id)} className="hidden" />
                  </label>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-orange-50 rounded-2xl flex items-center gap-3 border border-orange-100 shadow-sm">
                <AlertCircle size={20} className="text-orange-500" strokeWidth={2.5}/>
                <span className="text-sm font-bold text-orange-800">You have no active goals to fund!</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button 
             className="px-5 py-3 rounded-2xl font-bold text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
             onClick={() => setIsOptimizationModalOpen(false)}
          >
            Cancel
          </button>
          <button 
             disabled={!optGoalId}
             className="px-6 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-headline font-black rounded-2xl shadow-md hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border border-indigo-400"
             onClick={handleApplyOptimization}
          >
            Allocate Funds <ArrowRight size={18} strokeWidth={3}/>
          </button>
        </div>
      </Modal>

    </div>
  );
};

export default Goals;
