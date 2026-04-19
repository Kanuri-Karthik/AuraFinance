import { motion } from 'framer-motion';
import clsx from 'clsx';

const SkeletonLoader = ({ className, type = 'box' }) => {
  const baseClasses = "bg-surface/50 border border-borderLight/20 relative overflow-hidden";
  
  const types = {
    box: "rounded-2xl",
    text: "h-4 rounded-md",
    circle: "rounded-full"
  };

  return (
    <div className={clsx(baseClasses, types[type], className)}>
      <motion.div
        className="absolute inset-0 -translate-x-full"
        animate={{ translateX: ['-100%', '100%'] }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: "linear"
        }}
        style={{
          background: 'linear-gradient(90deg, transparent 0%, var(--glass-border) 50%, transparent 100%)',
          opacity: 0.5
        }}
      />
    </div>
  );
};

export default SkeletonLoader;
