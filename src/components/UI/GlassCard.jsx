import { motion } from 'framer-motion';
import clsx from 'clsx';

const GlassCard = ({ children, className, delay = 0, noHover = false, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={!noHover ? { y: -5, scale: 1.01 } : {}}
      className={clsx(
        "glass-panel rounded-2xl p-6 relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Subtle top-light reflection for glass effect */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
      {children}
    </motion.div>
  );
};

export default GlassCard;
