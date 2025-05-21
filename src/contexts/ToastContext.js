// src/contexts/ToastContext.js
import React, { createContext, useCallback, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    
    const showToast = useCallback(({ message, type = 'success', duration = 3000 }) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, duration }]);
    }, []);

    const showConfirmToast = useCallback(({ message, onConfirm, onCancel, confirmText = "Sí", cancelText = "No", type = "warning" }) => {
        const id = Date.now();
        const toast = {
            id,
            message,
            type,
            confirmText,
            cancelText,
            isConfirm: true,
            onConfirm: () => {
                removeToast(id);
                onConfirm?.();
            },
            onCancel: () => {
                removeToast(id);
                onCancel?.();
            }
        };
        setToasts((prev) => [...prev, toast]);
    }, []);

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    return (
    <ToastContext.Provider value={{ showToast, showConfirmToast }}>
        {children}
        <div className="fedes-toast-container">
        {toasts.map(({ id, ...rest }) => (
            <Toast
                key={id}
                {...rest}
                onClose={() => removeToast(id)}
            />
        ))}
        </div>
    </ToastContext.Provider>
    );

}
