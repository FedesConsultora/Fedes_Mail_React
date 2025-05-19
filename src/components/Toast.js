// Toast.js
import React, { useEffect, useRef, useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaTimes,
  FaExclamationTriangle
} from 'react-icons/fa';

const icons = {
  success: <FaCheckCircle />,
  error: <FaExclamationCircle />,
  info: <FaInfoCircle />,
  warning: <FaExclamationTriangle />
};

export default function Toast({
  message,
  type = 'info',
  onClose,
  duration = 3000,
  isConfirm = false,
  confirmText = 'Sí',
  cancelText = 'No',
  onConfirm,
  onCancel
}) {
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!isConfirm && !hovering) {
      timerRef.current = setTimeout(onClose, duration);
    }
    return () => clearTimeout(timerRef.current);
  }, [hovering, onClose, isConfirm, duration]);

  return (
    <div
      className={`toast ${type}`}
      onMouseEnter={() => {
        clearTimeout(timerRef.current);
        setHovering(true);
      }}
      onMouseLeave={() => {
        if (!isConfirm) {
          timerRef.current = setTimeout(onClose, duration);
        }
        setHovering(false);
      }}
    >
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message" dangerouslySetInnerHTML={{ __html: message }} />

      {isConfirm ? (
        <div className="toast-buttons">
          <button className="toast-btn cancel" onClick={onCancel}>{cancelText}</button>
          <button className="toast-btn confirm" onClick={onConfirm}>{confirmText}</button>
        </div>
      ) : (
        <button className="toast-close" onClick={onClose} title="Cerrar">
          <FaTimes />
        </button>
      )}
    </div>
  );
}
