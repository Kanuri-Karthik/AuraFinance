import { useState, useMemo, useRef } from 'react';
import Modal from '../components/UI/Modal';
import InputField from '../components/UI/InputField';
import AnimatedButton from '../components/UI/AnimatedButton';
import { FileDown, Plus, Search, Trash2, Edit2, ArrowUpRight, ArrowDownRight, Tag, Calendar, DollarSign, FileText, Camera, Loader2, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';
import Tesseract from 'tesseract.js';
import { useFinance } from '../context/FinanceContext';

const categories = ['Food', 'Salary', 'Entertainment', 'Utilities', 'Freelance', 'Housing', 'Transport', 'Other'];

const Transactions = () => {
  const { transactions, setTransactions, formatCurrency, currencySymbol } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [expandedTxId, setExpandedTxId] = useState(null);
  const fileInputRef = useRef(null);
  const { addNotification } = useNotification();

  // Filtering & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'expense',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Derived State
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (tx.notes && tx.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === 'All' || tx.category === categoryFilter;
      const matchesType = typeFilter === 'All' || tx.type === typeFilter;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [transactions, searchQuery, categoryFilter, typeFilter]);

  // Handlers
  const handleOpenModal = (tx = null) => {
    if (tx) {
      setCurrentTransaction(tx);
      setFormData({
        name: tx.name,
        amount: tx.amount.toString(),
        type: tx.type,
        category: tx.category,
        date: tx.date,
        notes: tx.notes || ''
      });
    } else {
      setCurrentTransaction(null);
      setFormData({
        name: '',
        amount: '',
        type: 'expense',
        category: 'Food',
        date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.amount || !formData.date) return;
    
    const newTx = {
      id: currentTransaction ? currentTransaction.id : Date.now().toString(),
      name: formData.name,
      amount: parseFloat(formData.amount),
      type: formData.type,
      category: formData.category,
      date: formData.date,
      notes: formData.notes
    };

    if (currentTransaction) {
      setTransactions(transactions.map(t => t.id === newTx.id ? newTx : t));
    } else {
      setTransactions([newTx, ...transactions]);
    }
    setIsModalOpen(false);
  };

  const handleScanBill = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsScanning(true);
    addNotification("Scanning Bill", "AI is analyzing the receipt...", "info");

    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;
      
      const textLines = text.split('\n').map(t => t.trim()).filter(t => t.length > 2 && /[a-zA-Z]{3,}/.test(t));
      let companyName = textLines.length > 0 ? textLines[0] : "Unknown Company";
      if (companyName.length > 30) companyName = companyName.substring(0, 30);
      
      const amountMatches = text.match(/\d+[\.,]\d{2}/g);
      let detectedAmount = "0.00";
      if (amountMatches && amountMatches.length > 0) {
        const parsedAmounts = amountMatches.map(str => parseFloat(str.replace(',', '.')));
        detectedAmount = Math.max(...parsedAmounts).toFixed(2);
      }

      const lowerText = text.toLowerCase();
      let detectedCategory = "Other";
      if (/food|burger|restaurant|cafe|coffee|eat|meal|grocery|supermarket/.test(lowerText)) detectedCategory = "Food";
      else if (/taxi|uber|lyft|transit|train|gas|fuel/.test(lowerText)) detectedCategory = "Transport";
      else if (/movie|cinema|ticket|entertainment/.test(lowerText)) detectedCategory = "Entertainment";
      else if (/walmart|amazon|target|clothes|shop|store/.test(lowerText)) detectedCategory = "Shopping";

      let detectedDate = new Date().toISOString().split('T')[0];
      const dateRegex = /\b(\d{1,4}[\/\-\.\s])(\d{1,2}[\/\-\.\s]?)(\d{1,4})\b/g;
      const dateMatches = text.match(dateRegex);
      let parsedDateObj = null;

      if (dateMatches && dateMatches.length > 0) {
        let bestDateStr = dateMatches[0];
        let normalized = bestDateStr.replace(/[\.\-\s]+/g, '/');
        let parts = normalized.split('/');
        
        if (parts.length === 3) {
          if (parts[0].length === 4) {
            parsedDateObj = new Date(`${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T12:00:00Z`);
          } else {
            const p1 = parseInt(parts[0]);
            const p2 = parseInt(parts[1]);
            const yyyy = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
            
            if (p1 > 12) {
              parsedDateObj = new Date(`${yyyy}-${parts[1].padStart(2, '0')}-${String(p1).padStart(2, '0')}T12:00:00Z`);
            } else {
              parsedDateObj = new Date(`${yyyy}-${String(p1).padStart(2, '0')}-${String(p2).padStart(2, '0')}T12:00:00Z`);
            }
          }
        }
      }
      
      if (!parsedDateObj || isNaN(parsedDateObj.getTime())) {
         const textDateRegex = /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+(\d{1,2})[\s,]+(\d{4})\b/i;
         const textMatch = text.match(textDateRegex);
         if (textMatch) {
            parsedDateObj = new Date(textMatch[0]);
         }
      }

      if (parsedDateObj && !isNaN(parsedDateObj.getTime())) {
         detectedDate = parsedDateObj.toISOString().split('T')[0];
      }

      setFormData({
        name: companyName,
        amount: detectedAmount,
        type: 'expense',
        category: detectedCategory,
        date: detectedDate,
        notes: `AI Scanned Receipt Context:\nCompany Identified: ${companyName}\n${text.substring(0, 100).replace(/\n/g, ' ')}...`
      });
      setCurrentTransaction(null);
      setIsModalOpen(true);

      addNotification("Scan Complete", "Verify the extracted details and save.", "success");
    } catch (error) {
       console.error(error);
       addNotification("Scan Failed", "Could not read the receipt clearly.", "danger");
    } finally {
       setIsScanning(false);
       if (fileInputRef.current) fileInputRef.current.value = ''; 
    }
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  return (
    <div className="relative font-body">
      {/* Search & Actions Header */}
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-1 font-headline">Transactions</h2>
          <p className="text-slate-500 text-sm font-bold tracking-wide">Manage your wealth movements</p>
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative group flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/60 backdrop-blur-xl border border-white shadow-sm rounded-2xl pl-12 pr-4 py-3 w-full md:w-72 text-sm font-medium focus:ring-2 focus:ring-indigo-100 transition-all outline-none text-slate-800 placeholder:text-slate-400" 
              placeholder="Search records..." 
            />
          </div>
          <div className="flex gap-2">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleScanBill} 
            />
            <button 
              onClick={() => !isScanning && fileInputRef.current?.click()}
              disabled={isScanning}
              className="p-3 bg-white/60 hover:bg-white text-slate-600 hover:text-slate-800 rounded-2xl transition-all flex items-center justify-center border border-white shadow-sm shrink-0"
            >
              {isScanning ? <Loader2 className="w-6 h-6 animate-spin" /> : <Camera className="w-6 h-6" />}
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="flex-1 md:flex-none px-6 py-3 bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-95 transition-all shadow-[0_8px_20px_rgba(99,102,241,0.3)] border border-indigo-400"
            >
              <Plus className="w-5 h-5" />
              New Record
            </button>
          </div>
        </div>
      </header>

      {/* Filters Bar */}
      <section className="bg-white/60 backdrop-blur-2xl rounded-3xl p-4 mb-8 flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6 border border-white shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black ml-2">Category:</span>
            <div className="relative">
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white/60 border border-white rounded-xl text-xs font-bold px-4 py-2.5 pr-10 appearance-none focus:ring-0 cursor-pointer text-slate-800 focus:bg-white shadow-sm transition-colors"
              >
                <option value="All">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Type:</span>
            <div className="relative">
              <select 
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-white/60 border border-white rounded-xl text-xs font-bold px-4 py-2.5 pr-10 appearance-none focus:ring-0 cursor-pointer text-slate-800 focus:bg-white shadow-sm transition-colors"
              >
                <option value="All">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="hidden xl:block h-8 w-[2px] bg-slate-200/50 mx-2"></div>
        
        <div className="flex-1 flex gap-2 overflow-x-auto hide-scrollbar">
          <button onClick={() => addNotification('Filter Applied', 'Showing data for This Month', 'info')} className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 text-xs font-bold hover:shadow-md shadow-sm border border-white transition-all whitespace-nowrap">This Month</button>
          <button onClick={() => addNotification('Filter Applied', 'Showing data for Last 30 Days', 'info')} className="px-5 py-2.5 rounded-xl bg-transparent text-slate-500 text-xs font-bold hover:bg-white/60 hover:text-slate-800 transition-all whitespace-nowrap">Last 30 Days</button>
        </div>
        
        <button onClick={() => addNotification('Filters Menu', 'Advanced filter modal opening soon', 'info')} className="flex items-center justify-center gap-2 text-indigo-600 text-xs font-black px-5 py-2.5 hover:bg-white/60 rounded-xl transition-all w-full xl:w-auto shadow-sm border border-transparent hover:border-white">
          <Filter className="w-4 h-4" strokeWidth={2.5} />
          Advanced Filters
        </button>
      </section>

      {/* Main Table Content */}
      <section className="space-y-3">
        {/* Row Header */}
        {filteredTransactions.length > 0 && (
          <div className="hidden md:grid grid-cols-12 px-6 py-2 text-[10px] uppercase tracking-widest text-slate-400 font-black">
            <div className="col-span-5">Transaction Detail</div>
            <div className="col-span-3">Date & Time</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2 text-center">Status</div>
          </div>
        )}

        {filteredTransactions.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-center bg-white/40 backdrop-blur-xl rounded-3xl border border-white shadow-sm">
            <Search className="w-12 h-12 mb-4 opacity-30 text-indigo-400" />
            <h3 className="text-lg font-black text-slate-800 mb-1 font-headline">No records found</h3>
            <p className="text-sm font-medium">Try adjusting your filters.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTransactions.map((tx, i) => {
              const isExpanded = expandedTxId === tx.id;
              
              return (
              <motion.div 
                key={tx.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, x: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: i * 0.05 }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(e, { offset, velocity }) => {
                  if (offset.x > 150 || (offset.x > 50 && velocity.x > 500)) {
                    handleDelete(tx.id);
                    addNotification("Deleted", "Transaction removed via swipe.", "info");
                  }
                }}
                className={`backdrop-blur-xl rounded-3xl group transition-all duration-300 relative shadow-sm hover:shadow-md mb-3 flex flex-col overflow-hidden ${
                  tx.type === 'income' 
                    ? 'bg-emerald-300 border border-emerald-400 hover:bg-emerald-400 text-slate-900' 
                    : 'bg-rose-100 border border-rose-300 hover:bg-rose-200'
                }`}
              >
                {/* Swipe background hint */}
                <div className="absolute inset-y-0 left-0 bg-error/20 flex items-center px-6 -z-10 w-full overflow-hidden">
                   <Trash2 className="text-error" />
                </div>
                
                {/* Main Card Content (Draggable Area) */}
                <div 
                   onClick={() => setExpandedTxId(isExpanded ? null : tx.id)}
                   className="grid grid-cols-12 items-center p-4 md:p-6 relative z-10 cursor-pointer"
                >
                  <div className="col-span-12 md:col-span-5 flex items-center justify-between md:justify-start gap-4 mb-4 md:mb-0">
                    <div className="flex items-center gap-4">
                      <motion.div 
                        whileHover={{ scale: 1.1, rotate: tx.type === 'income' ? 10 : -10 }}
                        className={`w-12 h-12 rounded-2xl flex shrink-0 items-center justify-center shadow-sm border ${
                        tx.type === 'income' 
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                          : 'bg-rose-50 text-rose-500 border-rose-100'
                      }`}>
                        {tx.type === 'income' ? <ArrowDownRight className="w-6 h-6 shrink-0" strokeWidth={2.5}/> : <ArrowUpRight className="w-6 h-6 shrink-0" strokeWidth={2.5}/>}
                      </motion.div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-base truncate max-w-[200px] xl:max-w-[300px]">{tx.name}</h4>
                        <p className="text-xs text-slate-600 font-bold mt-0.5 tracking-wide">{tx.category} • {tx.type}</p>
                      </div>
                    </div>
                    {/* Mobile Only Details */}
                    <div className="md:hidden text-right flex flex-col items-end shrink-0">
                      <p className={`text-lg font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-800' : 'text-slate-800'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </p>
                      <span className={`inline-block mt-1 px-3 py-1 text-[10px] font-black rounded-full shadow-sm ${tx.type === 'income' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-500 border border-white'}` }>
                        {tx.type === 'income' ? 'CLEARED' : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-3 hidden md:block">
                    <p className="text-sm font-bold text-slate-800">
                      {new Date(tx.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-0.5">Recorded</p>
                  </div>

                  <div className="col-span-2 text-right hidden md:block">
                    <p className={`text-xl font-black tracking-tight ${tx.type === 'income' ? 'text-emerald-800' : 'text-slate-800'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </p>
                  </div>

                  <div className="col-span-2 justify-center hidden md:flex">
                    <span className={`px-4 py-1.5 text-[10px] font-black tracking-widest rounded-full border shadow-sm ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-500 border-white'}` }>
                      {tx.type === 'income' ? 'CLEARED' : 'PENDING'}
                    </span>
                  </div>

                  {/* Desktop Hover actions */}
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 flex justify-end opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOpenModal(tx); }}
                      className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm border border-transparent hover:border-white bg-white/60"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(tx.id); }}
                      className="p-2.5 hover:bg-white rounded-xl text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-transparent hover:border-white bg-white/60"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details Section */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-surface-container-lowest border-t border-outline-variant/5 px-6"
                    >
                      <div className="py-6 flex flex-col md:flex-row justify-between gap-6">
                        <div className="space-y-4 flex-1">
                           <h5 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Transaction Notes</h5>
                           <p className="text-sm text-on-surface leading-relaxed whitespace-pre-line">{tx.notes || "No additional context provided."}</p>
                        </div>
                        <div className="bg-surface-container p-4 rounded-xl shrink-0 flex items-center justify-center gap-4">
                           <div className="flex flex-col gap-1 items-end">
                              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Actions</span>
                              <div className="flex gap-2">
                                <button onClick={() => handleOpenModal(tx)} className="text-primary text-xs font-bold hover:underline">Edit</button>
                                <span className="text-outline-variant/20">|</span>
                                <button onClick={() => handleDelete(tx.id)} className="text-error text-xs font-bold hover:underline">Delete</button>
                              </div>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )})}
          </AnimatePresence>
        )}
      </section>

      {/* Pagination component placeholder */}
      {filteredTransactions.length > 0 && (
        <div className="mt-12 flex flex-col items-center">
          <button onClick={() => addNotification('End of Results', 'All transactions loaded', 'success')} className="px-8 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl border border-outline-variant/10 hover:bg-surface-variant transition-all mb-4">
            Load more transactions
          </button>
          <p className="text-xs text-on-surface-variant">Showing {filteredTransactions.length} of {transactions.length} records</p>
        </div>
      )}

      {/* Side Decoration */}
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[150px] pointer-events-none -z-10 rounded-full"></div>
      <div className="fixed bottom-0 left-10 md:left-64 w-[300px] h-[300px] bg-secondary-container/5 blur-[100px] pointer-events-none -z-10 rounded-full"></div>

      {/* Add / Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={currentTransaction ? "Edit Transaction" : "Add New Transaction"}
      >
        <div className="space-y-4">
          <InputField 
            label="Transaction Name" 
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            icon={FileText}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField 
              label={`Amount (${currencySymbol})`} 
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              icon={DollarSign}
            />
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none z-10">
                <Tag className="w-[18px] h-[18px]" />
              </div>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full h-[54px] bg-surface-container-highest border border-outline-variant/20 rounded-xl pl-11 pr-4 text-on-surface outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <div className="relative">
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full h-[54px] bg-surface-container-highest border border-outline-variant/20 rounded-xl px-4 text-on-surface outline-none focus:border-primary transition-colors appearance-none cursor-pointer"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            
            <InputField 
              label="Date" 
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>

          <InputField 
            label="Notes (Optional)" 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            icon={FileText}
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <AnimatedButton variant="soft" onClick={() => setIsModalOpen(false)}>Cancel</AnimatedButton>
          <AnimatedButton onClick={handleSave}>
            {currentTransaction ? "Save Changes" : "Save Record"}
          </AnimatedButton>
        </div>
      </Modal>
    </div>
  );
};

export default Transactions;
