import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, BrainCircuit, X } from 'lucide-react';
import GlassCard from '../UI/GlassCard';
import { useFinance } from '../../context/FinanceContext';

const TypewriterText = ({ text, delay = 0 }) => {
  const characters = Array.from(text);
  
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay }
    }
  };
  
  const child = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.span variants={container} initial="hidden" animate="visible" className="inline-block">
      {characters.map((char, index) => (
        <motion.span key={index} variants={child} className="inline-block whitespace-pre-wrap">
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

const AIInsights = ({ transactions = [], totalExpenses = 0 }) => {
  const { formatCurrency } = useFinance();
  const [insights, setInsights] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const generateInsights = () => {
      const generated = [];
      const lowerTx = transactions.map(t => ({ ...t, name: t.name.toLowerCase() }));
      
      // Rule 1: High Spending Loop
      if (totalExpenses > 3000) {
        generated.push({
          id: 'high-spend',
          text: "You spent more this month compared to your average. Try to cut back on discretionary categories to stay on track."
        });
      }

      // Rule 2: Subscriptions
      const subscriptions = lowerTx.filter(t => t.name.includes('subscription') || t.name.includes('netflix') || t.name.includes('spotify') || t.name.includes('bill'));
      if (subscriptions.length > 0) {
        const subNames = subscriptions.map(s => s.name).join(', ');
        const totalSubAmount = subscriptions.reduce((sum, s) => sum + Math.abs(s.amount), 0);
        generated.push({
          id: 'subs',
          text: `Reduce subscriptions to save money. We noticed recurring charges like ${subNames} totaling ${formatCurrency(totalSubAmount)}.`
        });
      }

      // Rule 3: General positive reinforcement 
      if (generated.length === 0) {
        generated.push({
          id: 'good',
          text: "Looking great! Your spending is well within normal limits. Keep up the good work!"
        });
      }
      
      setInsights(generated);
    };

    generateInsights();
  }, [transactions, totalExpenses]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.4 }}
        >
          <GlassCard className="relative overflow-hidden mb-6 border-primary/30 shadow-lg shadow-primary/5">
            <div className="absolute top-0 right-0 p-4">
              <button 
                onClick={() => setIsVisible(false)}
                className="text-textMuted hover:text-danger focus:outline-none transition-colors"
                aria-label="Close UI"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="flex items-stretch gap-4">
              <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
                <Sparkles size={24} className="animate-pulse" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit size={16} className="text-secondary" />
                  <h3 className="text-lg font-bold text-textMain bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                    AI Financial Assistant
                  </h3>
                </div>
                
                <div className="flex flex-col gap-3">
                  {insights.map((insight, idx) => (
                    <div key={insight.id} className="bg-background/50 backdrop-blur border border-borderLight p-4 rounded-2xl rounded-tl-sm shadow-sm self-start max-w-[95%] md:max-w-[80%] relative before:content-[''] before:absolute before:-left-2 before:top-0 before:border-r-[10px] before:border-r-background/50 before:border-b-[10px] before:border-b-transparent">
                      <p className="text-textMain leading-relaxed font-medium">
                        <TypewriterText text={insight.text} delay={0.3 + (idx * 2)} />
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIInsights;
