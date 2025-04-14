import React from 'react';
import { FaArrowLeft, FaTrash, FaArchive, FaEnvelope } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function EmailToolbar({ onDelete, onArchive, onMarkUnread, showBack = true }) {
  const navigate = useNavigate();

  return (
    <div className="inboxToolbar">
      {showBack && (
        <button className="toolbarIcon" onClick={() => navigate('/')}>
          <FaArrowLeft title="Volver a Recibidos" />
        </button>
      )}
      <button className="toolbarIcon" onClick={onDelete}>
        <FaTrash title="Eliminar" />
      </button>
      <button className="toolbarIcon" onClick={onArchive}>
        <FaArchive title="Archivar" />
      </button>
      <button className="toolbarIcon" onClick={onMarkUnread}>
        <span className="icon-unread" title="Marcar como no leído">
            <FaEnvelope />
            <span className="unread-dot" />
        </span>
      </button>
    </div>
  );
}
