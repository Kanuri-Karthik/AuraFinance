import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import Sidebar from '../Sidebar/Sidebar';
import Topbar from '../Topbar/Topbar';
import AIChatbot from '../UI/AIChatbot';
import SpeedDialFAB from '../UI/SpeedDialFAB';
import Modal from '../UI/Modal';
import WeatherModal from '../UI/WeatherModal';
import Footer from './Footer';

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTodoOpen, setIsTodoOpen] = useState(false);
  const [isWeatherOpen, setIsWeatherOpen] = useState(false);
  const location = useLocation();

  // Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, text: "Check monthly subscription leaks", done: true },
    { id: 2, text: "Verify tax savings for Q3", done: false },
    { id: 3, text: "Update investment portfolio", done: false }
  ]);
  const [newTaskText, setNewTaskText] = useState("");

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const addTask = (e) => {
    if (e.key === 'Enter' && newTaskText.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTaskText.trim(), done: false }]);
      setNewTaskText("");
    }
  };

  return (
    <div className="font-body text-slate-800 h-screen w-full relative flex flex-col">
      {/* Colorful Animated Background Blobs that span the entire application */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-gradient-to-br from-blue-100 to-sky-100">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-300/60 blur-[120px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-300/40 blur-[120px]" />
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute bottom-[-10%] left-[10%] w-[40%] h-[40%] rounded-full bg-indigo-300/40 blur-[100px]" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 140, repeat: Infinity, ease: "linear" }} className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-sky-400/30 blur-[120px]" />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[4px]"></div>
      </div>

      <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
      
      <div className="flex flex-1 overflow-hidden pt-20">
        <Sidebar 
          isOpen={isMobileMenuOpen} 
          setIsOpen={setIsMobileMenuOpen} 
        />
        
        <main className="lg:ml-64 flex-1 h-full overflow-y-auto overflow-x-hidden w-full scroll-smooth">
          <div className="p-6 lg:p-10 min-h-full">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
          <Footer />
        </main>
      </div>

      <SpeedDialFAB 
        onChatOpen={() => setIsChatOpen(true)}
        onTodoOpen={() => setIsTodoOpen(true)}
        onWeatherOpen={() => setIsWeatherOpen(true)}
      />
      
      <AIChatbot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />

      {/* Quick Tools Modals */}
      <Modal isOpen={isTodoOpen} onClose={() => setIsTodoOpen(false)} title="Quick Tasks">
        <div className="space-y-4">
          <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-4 p-4 bg-white/40 border border-white rounded-2xl group hover:bg-white/60 transition-colors">
                <input 
                  type="checkbox" 
                  checked={task.done} 
                  onChange={() => toggleTask(task.id)} 
                  className="w-5 h-5 accent-emerald-500 rounded-lg cursor-pointer flex-shrink-0" 
                />
                <span className={`text-sm font-bold flex-1 ${task.done ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                  {task.text}
                </span>
                <button 
                  onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                  className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 font-black text-xl leading-none transition-opacity px-2"
                >
                  &times;
                </button>
              </div>
            ))}
            {tasks.length === 0 && (
              <p className="text-center text-slate-400 text-sm font-bold py-4">All caught up! No active tasks.</p>
            )}
          </div>
          
          <input 
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            onKeyDown={addTask}
            placeholder="+ Type a new task and press Enter"
            className="w-full py-4 px-5 text-sm font-bold text-slate-700 bg-white/60 border-2 border-indigo-100 rounded-2xl outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-indigo-300"
          />
        </div>
      </Modal>

      <WeatherModal isOpen={isWeatherOpen} onClose={() => setIsWeatherOpen(false)} />
    </div>
  );
};

export default Layout;
