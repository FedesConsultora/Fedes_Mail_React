/*  src/components/EmailToolbar.js  */
import {
  FaArrowLeft, FaTrash, FaArchive, FaEnvelope, FaUndoAlt
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import api         from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function EmailToolbar({
  mailId,
  isRead,
  onArchive,
  onToggleRead,
  onRestore,              
  restoreIcon  = <FaUndoAlt />,
  restoreTitle = 'Restaurar correo'
}) {
  const navigate                     = useNavigate();
  const location                     = useLocation();
  const { showConfirmToast, showToast } = useToast();

  const isTrash = location.pathname.includes('/trash');
  const isSpam  = location.pathname.includes('/spam');

  /* carpeta para API delete */
  const currentFolder = isTrash
    ? 'trash'
    : isSpam
      ? 'spam'
      : location.pathname.includes('/sent')
        ? 'sent'
        : 'inbox';

  /* -------- eliminar definitivamente / mover a papelera -------- */
  const handleDelete = async () => {
    try {
      await api.deleteMails({ folder: currentFolder, mail_ids: [mailId] });
      showToast({ message: '🗑️ Correo eliminado', type: 'warning' });
      navigate(`/`);
    } catch (err) {
      console.error(err);
      showToast({ message: '❌ No se pudo eliminar', type: 'error' });
    }
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="inboxToolbar">
      {/* volver ------------------------------------------------------ */}
      <button className="toolbarIcon" onClick={() => navigate(-1)}>
        <FaArrowLeft title="Volver" />
      </button>

      {/* borrar ------------------------------------------------------ */}
      <button className="toolbarIcon" onClick={handleDelete}>
        <FaTrash title="Eliminar" />
      </button>

      {/* archivar (solo inbox) -------------------------------------- */}
      {!isTrash && !isSpam && onArchive && (
        <button className="toolbarIcon" onClick={onArchive}>
          <FaArchive title="Archivar" />
        </button>
      )}

      {/* leído / no leído (no en trash ni spam) --------------------- */}
      {!isTrash && !isSpam && onToggleRead && (
        <button
          className="toolbarIcon"
          onClick={onToggleRead}
          title={isRead ? 'Marcar como no leído' : 'Marcar como leído'}
        >
          <span className="icon-unread">
            <FaEnvelope />
            {isRead && <span className="unread-dot" />}
          </span>
        </button>
      )}

      {/* restaurar / mover a Recibidos ------------------------------ */}
      {onRestore && (
        <button
          className="toolbarIcon"
          onClick={() => {
            if (isSpam) {
              showConfirmToast({
                message: '¿Mover este correo a Recibidos?',
                type: 'warning',
                confirmText: 'Mover',
                cancelText: 'Cancelar',
                onConfirm: onRestore
              });
            } else {
              onRestore();
            }
          }}
          title={restoreTitle}
        >
          {restoreIcon}
        </button>
      )}
    </div>
  );
}
