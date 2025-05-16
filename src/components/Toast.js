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

export default function Toast({ message, type = 'info', onClose }) {
  const [hovering, setHovering] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!hovering) {
      timerRef.current = setTimeout(onClose, 3000);
    }
    return () => clearTimeout(timerRef.current);
  }, [hovering, onClose]);

  return (
    <div
      className={`toast ${type}`}
      onMouseEnter={() => {
        clearTimeout(timerRef.current);
        setHovering(true);
      }}
      onMouseLeave={() => {
        timerRef.current = setTimeout(onClose, 3000);
        setHovering(false);
      }}
    >
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={onClose} title="Cerrar">
        <FaTimes />
      </button>
    </div>
  );
}
