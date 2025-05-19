// src/components/EmailToolbar.js
import { FaArrowLeft, FaTrash, FaArchive, FaEnvelope, FaUndoAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function EmailToolbar({
  mailId,
  isRead,
  onArchive,
  onMarkUnread,
  onRestore
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { showConfirmToast, showToast } = useToast();

  const isTrash = location.pathname.includes('/trash');
  const currentFolder = isTrash ? 'trash' : location.pathname.includes('/sent') ? 'sent' : 'inbox';

  const handleDelete = () => {
    showConfirmToast({
      message: '¿Eliminar este correo permanentemente?',
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await api.deleteMails({ folder: currentFolder, mail_ids: [mailId] });
          showToast({ message: '🗑️ Correo eliminado', type: 'warning' });
          navigate('/trash');
        } catch (err) {
          console.error('❌ Error al eliminar:', err);
          showToast({ message: '❌ No se pudo eliminar', type: 'error' });
        }
      }
    });
  };

  return (
    <div className="inboxToolbar">
      <button className="toolbarIcon" onClick={() => navigate(-1)}>
        <FaArrowLeft title="Volver" />
      </button>

      <button className="toolbarIcon" onClick={handleDelete}>
        <FaTrash title="Eliminar" />
      </button>

      {!isTrash && onArchive && (
        <button className="toolbarIcon" onClick={onArchive}>
          <FaArchive title="Archivar" />
        </button>
      )}

      {!isTrash && onMarkUnread && (
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
      )}

      {isTrash && onRestore && (
        <button
          className="toolbarIcon"
          onClick={onRestore}
          title="Restaurar correo"
        >
          <FaUndoAlt />
        </button>
      )}
    </div>
  );
}
