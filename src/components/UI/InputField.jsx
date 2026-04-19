import { useState, useId } from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const InputField = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  icon: Icon,
  className,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const id = useId();
  const isActive = isFocused || Boolean(value);

  return (
    <div className={clsx("relative w-full", className)}>
      <motion.div 
        className={clsx(
          "absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-secondary opacity-0 transition-opacity duration-300 -z-10 blur-sm",
          isFocused && "opacity-30"
        )}
      />
      
      <div className="relative flex items-center bg-surface border rounded-xl overflow-hidden transition-colors duration-300 border-borderLight hover:border-textMuted/50 focus-within:border-primary px-4 pb-2.5 pt-6">
        {Icon && (
          <div className="mr-3 text-textMuted z-10 flex-shrink-0">
            <Icon size={18} className={isFocused ? "text-primary transition-colors" : ""} />
          </div>
        )}
        
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent text-textMain outline-none placeholder-transparent focus:placeholder-textMuted/40 peer z-10"
          placeholder={props.placeholder || " "}
          style={{ transition: 'background-color 9999s ease-out, color 9999s ease-out' }}
          {...props}
        />
        
        <label
          htmlFor={id}
          className={clsx(
            "absolute transition-all duration-300 pointer-events-none z-20",
            Icon ? "left-[46px]" : "left-4",
            isActive 
              ? "text-xs top-1.5 text-primary font-medium" 
              : "text-sm top-[22px] text-textMuted peer-focus:top-1.5 peer-focus:text-xs peer-focus:text-primary peer-focus:font-medium peer-valid:top-1.5 peer-valid:text-xs peer-valid:font-medium peer-[:not(:placeholder-shown)]:top-1.5 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-medium"
          )}
        >
          {label}
        </label>
      </div>
    </div>
  );
};

export default InputField;
