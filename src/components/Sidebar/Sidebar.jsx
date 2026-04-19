import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, ArrowRightLeft, Wallet, Target, PieChart, Settings,
  LogOut, HelpCircle, X, ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/transactions', icon: ArrowRightLeft, label: 'Transactions' },
  { path: '/budgets', icon: Wallet, label: 'Budgets' },
  { path: '/goals', icon: Target, label: 'Goals' },
  { path: '/reports', icon: PieChart, label: 'Analytics' },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { currentUser, logout } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      addNotification("Logged out", "You have been securely logged out.", "success");
      navigate('/login');
    } catch (err) {
      addNotification("Error", "Failed to log out.", "error");
    }
  };

  return (
    <>
      <div className={clsx(
        "fixed top-0 lg:top-20 bottom-0 left-0 z-40 w-64 bg-white/40 backdrop-blur-2xl border-r border-white flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 shadow-xl",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex justify-between items-center mb-8 lg:hidden">
          <span className="text-2xl font-black tracking-tight text-slate-800 font-headline">AuraFinance</span>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800 p-2">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 mt-2 lg:mt-0 overflow-y-auto hide-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                clsx(
                  "flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 font-medium",
                  isActive 
                    ? "bg-white text-indigo-700 shadow-md border border-white translate-x-1" 
                    : "text-slate-600 hover:text-indigo-600 hover:bg-white/60 hover:shadow-sm"
                )
              }
            >
              <item.icon size={20} />
              <span className="text-sm font-bold uppercase tracking-wider font-headline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 space-y-2 border-t border-slate-200/50 pt-6">
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-white p-4 rounded-3xl mb-6 group cursor-pointer shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Pro Member</p>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {currentUser?.email ? currentUser.email : 'Unlock advanced multi-currency tracking and AI forecasts.'}
            </p>
            {!currentUser && <button onClick={() => navigate('/settings')} className="mt-3 text-xs font-bold text-indigo-700 hover:text-indigo-800 underline underline-offset-4 cursor-pointer">Upgrade to Pro</button>}
          </div>

          <NavLink
             to="/settings"
             onClick={() => setIsOpen(false)}
             className={({ isActive }) => 
              clsx(
                "flex items-center gap-4 px-4 py-3 hover:bg-white/60 hover:shadow-sm rounded-2xl transition-all",
                isActive ? "text-indigo-700 bg-white shadow-md border border-white" : "text-slate-600 hover:text-indigo-600"
              )
            }
          >
            <Settings size={20} />
            <span className="text-sm font-bold uppercase tracking-wider font-headline">Settings</span>
          </NavLink>

          <button 
             className="w-full flex items-center gap-4 text-rose-500 hover:text-rose-600 px-4 py-3 hover:bg-white/60 hover:shadow-sm rounded-2xl transition-all"
             onClick={handleLogout}
          >
            <LogOut size={20} />
            <span className="text-sm font-bold uppercase tracking-wider font-headline">Logout</span>
          </button>
        </div>
      </div>
      
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
