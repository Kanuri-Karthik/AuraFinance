/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Info, Bell, X, Wallet } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const addNotification = useCallback((title, message, type = 'info', duration = 5000) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  }, [removeNotification]);

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <ToastContainer notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

const ToastContainer = ({ notifications, removeNotification }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {notifications.map(notif => (
          <ToastItem key={notif.id} notification={notif} onDismiss={() => removeNotification(notif.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem = ({ notification, onDismiss }) => {
  const { title, message, type } = notification;

  const getIconAndColor = () => {
    switch (type) {
      case 'budget':
        return { icon: AlertCircle, color: 'text-danger', bg: 'bg-danger/20', border: 'border-danger', shadow: 'shadow-[0_0_15px_rgba(var(--color-danger),0.15)]' };
      case 'spending':
        return { icon: Wallet, color: 'text-primary', bg: 'bg-primary/20', border: 'border-primary', shadow: 'shadow-[0_0_15px_rgba(var(--color-primary),0.15)]' };
      case 'reminder':
        return { icon: Bell, color: 'text-accent', bg: 'bg-accent/20', border: 'border-accent', shadow: 'shadow-[0_0_15px_rgba(var(--color-accent),0.15)]' };
      case 'success':
        return { icon: CheckCircle, color: 'text-[#10b981]', bg: 'bg-[#10b981]/20', border: 'border-[#10b981]', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.15)]' };
      default:
        return { icon: Info, color: 'text-secondary', bg: 'bg-secondary/20', border: 'border-secondary', shadow: 'shadow-[0_0_15px_rgba(var(--color-secondary),0.15)]' };
    }
  };

  const { icon: Icon, color, bg, border, shadow } = getIconAndColor();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`bg-surface/90 backdrop-blur-md rounded-2xl p-4 flex items-start gap-4 min-w-[300px] max-w-[350px] pointer-events-auto border-l-4 border-y border-r border-y-borderLight border-r-borderLight ${border} ${shadow}`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${bg} ${color}`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 pt-1">
        <h4 className="text-textMain font-semibold text-sm mb-1">{title}</h4>
        <p className="text-textMuted text-xs leading-relaxed">{message}</p>
      </div>
      <button 
        onClick={onDismiss}
        className="text-textMuted hover:text-textMain transition-colors shrink-0 p-1 rounded-full hover:bg-surfaceLight"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
};
