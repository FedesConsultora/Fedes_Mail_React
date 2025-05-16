// src/contexts/ToastContext.js
import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast'; // 👈 asegurate de importar el componente

const ToastContext = createContext();

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = ({ message, type = 'success', duration = 3000 }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(({ id, message, type, duration }) => (
          <Toast
            key={id}
            message={message}
            type={type}
            onClose={() => removeToast(id)}
            duration={duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
