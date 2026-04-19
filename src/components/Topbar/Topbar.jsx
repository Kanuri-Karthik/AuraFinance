import { Menu, Search, Bell, Settings, Plus, Mic, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNotification } from '../../context/NotificationContext';
import { useFinance } from '../../context/FinanceContext';
import { useVoiceTransaction } from '../../hooks/useVoiceTransaction';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Topbar = ({ onMenuClick }) => {
  const { theme, toggleTheme } = useTheme();
  const { addNotification } = useNotification();
  const { currency, setCurrency } = useFinance();
  const { isListening, startListening } = useVoiceTransaction();
  const navigate = useNavigate();
  
  const handleTestNotification = () => {
    const notificationTypes = [
      { t: 'budget', title: 'Budget Alert', msg: 'You have exceeded 90% of your Dining budget this month.' },
      { t: 'spending', title: 'Spending Update', msg: 'Your weekly spending is 15% lower than average. Great job!' },
      { t: 'reminder', title: 'Payment Reminder', msg: 'Your Internet bill of $60 is due in 3 days.' }
    ];
    const random = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    addNotification(random.title, random.msg, random.t);
  };

  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-20 bg-white/40 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.02)] border-b border-white">
      <div className="flex items-center gap-4 md:gap-8">
        <button 
          className="lg:hidden p-2 text-slate-500 hover:text-slate-800 hover:bg-white/60 rounded-xl transition-colors shadow-sm"
          onClick={onMenuClick}
        >
          <Menu size={24} />
        </button>
        <span className="text-2xl font-black tracking-tight text-slate-800 font-headline hidden sm:block">AuraFinance</span>
        
        <div className="hidden md:flex bg-white/60 border border-white shadow-sm rounded-2xl px-5 py-2.5 items-center gap-3 w-64 lg:w-80 group hover:shadow-md transition-all">
          <Search className="text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search analytics..." 
            className="bg-transparent border-none text-sm font-medium focus:ring-0 text-slate-800 placeholder:text-slate-400 w-full outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        {/* Currency Switcher */}
        <select 
          value={currency} 
          onChange={(e) => setCurrency(e.target.value)}
          className="hidden sm:block bg-white/60 shadow-sm border border-white rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 focus:border-indigo-300 outline-none cursor-pointer transition-all focus:ring-2 focus:ring-indigo-100"
        >
          <option value="USD">USD ($)</option>
          <option value="EUR">EUR (€)</option>
          <option value="GBP">GBP (£)</option>
          <option value="INR">INR (₹)</option>
          <option value="JPY">JPY (¥)</option>
        </select>

        <button 
          onClick={() => navigate('/transactions')}
          className="hidden lg:flex items-center gap-2 bg-gradient-to-br from-indigo-500 to-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(99,102,241,0.3)] shadow-md border border-indigo-400"
        >
          <Plus strokeWidth={3} size={18} />
          Add Transaction
        </button>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Voice Input */}
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={startListening}
            className={`p-2.5 rounded-xl transition-all duration-300 shadow-sm border border-transparent ${isListening ? 'bg-rose-100/80 text-rose-600 border-rose-200 shadow-rose-200 glow' : 'bg-white/60 text-slate-500 hover:bg-white hover:text-slate-800 hover:border-white hover:shadow-md'}`}
            title="Voice Transaction"
          >
            <Mic className={isListening ? "animate-pulse" : ""} size={20} />
          </motion.button>
          
          <button onClick={toggleTheme} className="p-2.5 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-800 shadow-sm border border-transparent hover:border-white hover:shadow-md rounded-xl transition-all duration-300">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <button onClick={handleTestNotification} className="relative p-2.5 bg-white/60 text-slate-500 hover:bg-white hover:text-slate-800 shadow-sm border border-transparent hover:border-white hover:shadow-md rounded-xl transition-all duration-300">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-white shadow-sm"></span>
          </button>

          <div onClick={() => navigate('/profile')} className="h-11 w-11 rounded-2xl overflow-hidden border-2 border-white shadow-md ml-3 cursor-pointer hover:border-indigo-300 transition-colors">
            <img alt="User profile avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnilkJZQATPGjCA3dj9l-cz8KXaucguHj7agtxcZvJJ9eM8gYTYUvuFWOKOTKS5GRGWk-D6K4RdoaNfO4aMOZ9XgKcpp8mYQZN12izN5KPIZj_fNLMo-E52z-oqSYysoXK0RQ3W1zd_guCF9xPpfd8Nc_FqN6axc77FbjBv7wTUCbwzRUTbYIR76UKAaDsu_LN-GT04lBRsdkIhzuOj55ODmXcc2gSTBbciLrvpgYebQ5JTbbjlKm_WfE0sFUVWSME_wMHbBx1bJc"/>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
