import React, { useEffect } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000); // 4 seconds auto-dismiss

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-bounce-short">
      <div 
        className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg border text-white glassmorphism border-border-divider/30`}
        style={{ 
          backgroundColor: type === 'success' ? 'var(--color-toast-bg, #6B7C3F)' : 'var(--color-danger, #B94040)' 
        }}
      >
        {type === 'success' ? (
          <CheckCircle size={20} className="shrink-0" />
        ) : (
          <AlertTriangle size={20} className="shrink-0" />
        )}
        <p className="font-medium text-sm">{message}</p>
        <button 
          onClick={onClose} 
          className="ml-2 p-1 hover:bg-black/10 rounded-full transition-colors"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
