import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import clsx from 'clsx';

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within a ToastProvider');
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback(({ message, type = 'info', duration = 3000 }) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
        return id; // Return ID for manual removal if needed
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast, removeToast }}>
            {children}
            <div
                style={{
                    position: 'fixed',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '90%',
                    maxWidth: '400px',
                    pointerEvents: 'none'
                }}
            >
                <AnimatePresence>
                    {toasts.map(toast => (
                        <motion.div
                            key={toast.id}
                            initial={{ opacity: 0, y: -20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                            layout
                            className={clsx(
                                'glass-panel',
                                'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
                                {
                                    'border-green-500/50 text-white': toast.type === 'success',
                                    'border-red-500/50 text-white': toast.type === 'error',
                                    'border-blue-500/50 text-white': toast.type === 'info',
                                    'border-white/20 text-white': toast.type === 'loading',
                                }
                            )}
                            style={{
                                pointerEvents: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: 'rgba(20, 20, 20, 0.9)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: 'white'
                            }}
                        >
                            {toast.type === 'success' && <Check size={20} className="text-green-400" style={{ color: 'var(--color-aura-positive)' }} />}
                            {toast.type === 'error' && <AlertCircle size={20} className="text-red-400" style={{ color: 'var(--color-aura-negative)' }} />}
                            {toast.type === 'info' && <Info size={20} className="text-blue-400" />}
                            {toast.type === 'loading' && <Loader2 size={20} className="animate-spin" />}

                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{toast.message}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
};
