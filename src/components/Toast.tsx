import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string | null;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'success', onClose }) => {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -40 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] shadow-2xl rounded-2xl px-4 py-3 border border-white/10 backdrop-blur-xl flex items-center space-x-3 bg-neutral-900/95 text-white"
        >
          {type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          {type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />}
          {type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
          <span className="text-sm font-medium flex-1">{message}</span>
          <button
            onClick={onClose}
            className="text-xs text-neutral-400 hover:text-white px-2 py-1 rounded"
          >
            OK
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
