import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';

const AnimatedCounter = ({ from = 0, to, duration = 2 }) => {
  const spring = useSpring(from, { duration: duration * 1000, bounce: 0 });
  
  // Format the number to currency style (e.g., 24,562.00)
  const formatted = useTransform(spring, (current) => {
    return current.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  });

  useEffect(() => {
    spring.set(to);
  }, [spring, to]);

  return <motion.span>{formatted}</motion.span>;
};

export default AnimatedCounter;
