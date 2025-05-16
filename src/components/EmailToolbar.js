import React from 'react';
import { FaArrowLeft, FaTrash, FaArchive, FaEnvelope } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

export default function EmailToolbar({
  mailId,
  showBack = true,
  isRead,
  onArchive,
  onMarkUnread,
}) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🔍 Detección automática de carpeta
  const getFolderFromPath = (pathname) => {
    if (pathname.includes('/sent')) return 'sent';
    if (pathname.includes('/starred')) return 'starred';
    if (pathname.includes('/spam')) return 'spam';
    return 'inbox';
  };

  const currentFolder = getFolderFromPath(location.pathname);

  const handleDelete = async () => {
    try {
      await api.deleteMails({
        folder: currentFolder,
        mail_ids: [mailId],
      });
      navigate(-1); // volver al listado anterior
    } catch (err) {
      console.error('❌ Error al eliminar desde el detalle:', err);
      alert('Error al eliminar el correo');
    }
  };

  return (
    <div className="inboxToolbar">
      {showBack && (
        <button className="toolbarIcon" onClick={() => navigate(-1)}>
          <FaArrowLeft title="Volver" />
        </button>
      )}
      <button className="toolbarIcon" onClick={handleDelete}>
        <FaTrash title="Eliminar" />
      </button>
      <button className="toolbarIcon" onClick={onArchive}>
        <FaArchive title="Archivar" />
      </button>
      <button
        className="toolbarIcon"
        onClick={onMarkUnread}
        title={isRead ? 'Marcar como no leído' : 'Marcar como leído'}
      >
        <span className="icon-unread">
          <FaEnvelope />
          {isRead && <span className="unread-dot" />}
        </span>
      </button>
    </div>
  );
}
