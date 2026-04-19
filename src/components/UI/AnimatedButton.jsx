import { motion } from 'framer-motion';
import clsx from 'clsx';

const AnimatedButton = ({ 
  children, 
  variant = 'primary', 
  className, 
  icon: Icon,
  bgClass,
  hoverClass,
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-colors duration-300 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 hover:shadow-primary/50",
    soft: "bg-surface text-textMain shadow-soft hover:bg-background border border-borderLight",
    danger: "bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={clsx(baseStyles, variants[variant], className)}
      {...props}
    >
      {/* Inner highlight for 3D effect */}
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out pointer-events-none" />
      
      {Icon && <Icon size={18} className="relative z-10" />}
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default AnimatedButton;
