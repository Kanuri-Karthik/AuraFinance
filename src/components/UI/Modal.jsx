import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

const Modal = ({ isOpen, onClose, title, children }) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[1000] bg-background/30 backdrop-blur-md"
          />
          
          {/* Modal Content */}
          <div className="fixed inset-0 z-[1001] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none perspective-[1000px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: "100%", rotateX: -15 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: "100%", rotateX: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="glass-panel w-full max-w-md rounded-t-[2rem] sm:rounded-2xl shadow-2xl pointer-events-auto border border-borderLight/50 overflow-hidden transform-style-3d bg-surface/90 max-h-[85vh] sm:max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-center pt-3 pb-1 sm:hidden">
                 <div className="w-12 h-1.5 bg-borderLight rounded-full opacity-50"></div>
              </div>
              <div className={clsx(
                "flex items-center justify-between p-6 shrink-0",
                title && "border-b border-borderLight"
              )}>
                {title ? (
                  <h3 className="text-xl font-bold text-textMain tracking-tight">{title}</h3>
                ) : <div />}
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full text-textMuted hover:bg-background hover:text-textMain transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-6 overflow-y-auto min-h-0">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default Modal;
