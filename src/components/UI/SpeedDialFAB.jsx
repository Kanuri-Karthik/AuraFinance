import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckSquare, CloudSun, X, Bot, Plus } from 'lucide-react';

const SpeedDialFAB = ({ onChatOpen, onTodoOpen, onWeatherOpen }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const actions = [
    { 
      id: 'chatbot',
      icon: <Bot size={22} />, 
      label: 'AI Assistant', 
      color: 'bg-gradient-to-br from-indigo-500 to-blue-600', 
      onClick: onChatOpen 
    },
    { 
      id: 'todo',
      icon: <CheckSquare size={22} />, 
      label: 'My Tasks', 
      color: 'bg-gradient-to-br from-emerald-500 to-teal-600', 
      onClick: onTodoOpen 
    },
    { 
      id: 'weather',
      icon: <CloudSun size={22} />, 
      label: 'Live Weather', 
      color: 'bg-gradient-to-br from-sky-400 to-blue-500', 
      onClick: onWeatherOpen 
    },
  ];

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05
      }
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.5, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: 'spring', stiffness: 500, damping: 30 }
    },
    exit: { opacity: 0, scale: 0.5, y: 20 }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]" ref={menuRef}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute bottom-20 right-0 flex flex-col items-end gap-5 mb-2"
          >
            {actions.map((action) => (
              <motion.div
                key={action.id}
                variants={itemVariants}
                className="flex items-center gap-4 group"
              >
                {/* Desktop Tooltip */}
                <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                  <div className="bg-white/80 backdrop-blur-xl border border-white/50 px-4 py-2 rounded-2xl shadow-xl">
                    <span className="text-xs font-black text-slate-700 whitespace-nowrap tracking-wide uppercase">
                      {action.label}
                    </span>
                  </div>
                </div>

                {/* Mobile Label (optional, could be shown on hover for touch too) */}
                
                {/* Action Button */}
                <button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-14 h-14 rounded-2xl ${action.color} text-white shadow-lg flex items-center justify-center hover:scale-110 active:scale-90 transition-all duration-300 group-hover:shadow-[0_10px_25px_rgba(0,0,0,0.2)] border border-white/20`}
                  title={action.label}
                >
                  {action.icon}
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center text-white relative z-10 overflow-hidden transition-colors duration-500 ${
          isOpen ? 'bg-slate-900 shadow-slate-900/40' : 'bg-[#2563eb] shadow-blue-600/40'
        } border border-white/20`}
      >
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0.2 }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
              className="absolute inset-0 bg-white rounded-full"
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={{ rotate: isOpen ? 135 : 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="relative z-10"
        >
          {isOpen ? <Plus size={32} strokeWidth={2.5} /> : <Sparkles size={28} strokeWidth={2} />}
        </motion.div>
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
      </motion.button>
    </div>
  );
};

export default SpeedDialFAB;
