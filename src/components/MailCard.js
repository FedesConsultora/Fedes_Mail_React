import { useLocation, useNavigate } from 'react-router-dom';
import { FaRegStar, FaStar, FaTrash, FaArchive, FaEnvelope } from 'react-icons/fa';
import {
  AiFillFilePdf,
  AiFillFileImage,
  AiFillFileWord,
  AiFillFileExcel,
  AiFillFile
} from 'react-icons/ai';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

const MailCard = ({ mail = {}, selected = false, onToggle = () => {}, isSent = false, onMarkRead = () => {}, onToggleFavorite = () => {}, onDeleteMail = () => {},  }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const getCurrentFolder = () => {
    const path = location.pathname;
    if (path.includes('/sent')) return 'sent';
    if (path.includes('/starred')) return 'starred';
    if (path.includes('/spam')) return 'spam';
    return 'inbox';
  };
  const currentFolder = getCurrentFolder();

  const isToday = (dateStr) => {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); 
    onToggleFavorite(mail.id, !mail.favorite); 
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return isToday(dateStr)
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const handleClick = (e) => {
    const isInteractive = e.target.closest('input, button, .attachment-pill, .hover-actions');
    if (!isInteractive && mail.id) {
      if (!mail.is_read) onMarkRead(mail.id);
      navigate(`${isSent ? '/sent' : ''}/email/${mail.id}`);
    }

  };

  const handleMarkReadClick = (e) => {
    e.stopPropagation(); 
    onMarkRead(mail.id, !mail.is_read);  // ← Cambia el estado, no solo lo marca leído
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      const res = await api.deleteMails({ folder: currentFolder, mail_ids: [mail.id] });

      // Solo si todo salió bien
      if (res?.success || res?.ok !== false) {
        onDeleteMail(mail.id);
        showToast({ message: '🗑️ Correo eliminado', type: 'warning' });

      } else {
        throw new Error('Respuesta no válida del servidor');
      }

    } catch (err) {
      console.error('❌ Error al eliminar correo:', err);
      showToast({ message: '❌ No se pudo eliminar el correo', type: 'error' });

    }
  };

  const getAttachmentIcon = (name) => {
    if (typeof name !== 'string') return <AiFillFile className="file-icon" />;
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <AiFillFilePdf className="file-icon" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <AiFillFileImage className="file-icon" />;
    if (['doc', 'docx'].includes(ext)) return <AiFillFileWord className="file-icon" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <AiFillFileExcel className="file-icon" />;
    return <AiFillFile className="file-icon" />;
  };

  return (
    <div className={`mail-card ${mail.state || ''}`} onClick={handleClick}>
      <div className="mail-row">
        <input type="checkbox" checked={selected} onChange={onToggle} />
        <button
          className="starBtn"
          title={mail.favorite ? 'Quitar de destacados' : 'Marcar como destacado'}
          onClick={handleToggleFavorite}
        >
          {mail.favorite ? <FaStar /> : <FaRegStar />}
        </button>

        <div className="mail-info">
          <strong className="mail-sender">{mail.de || 'Remitente desconocido'}</strong>
          <span className="mail-subject">{mail.asunto || '(Sin asunto)'}</span>
          <span
            className="mail-snippet"
            dangerouslySetInnerHTML={{
              __html: typeof mail.contenido === 'string'
                ? mail.contenido.slice(0, 80)
                : ''
            }}
          />
        </div>

        <span className="mail-date">{formatDate(mail.fecha)}</span>

        <div className="hover-actions">
          <button title="Eliminar" onClick={handleDelete}>
            <FaTrash />
          </button>
          <button title="Archivar"><FaArchive /></button>
          <button
            title={mail.is_read ? 'Marcar como no leído' : 'Marcar como leído'}
            className="unread-icon"
            onClick={handleMarkReadClick}
          >
            <FaEnvelope />
            {mail.is_read && <span className="dot" />} 
          </button>
        </div>
      </div>

      {Array.isArray(mail.adjuntos) && mail.adjuntos.length > 0 && (
        <div className="mail-attachment-row">
          {mail.adjuntos.slice(0, 4).map((att, idx) => (
            <a
              key={idx}
              href={att?.url || '#'}
              className="attachment-pill"
              target="_blank"
              rel="noopener noreferrer"
              title={att?.nombre || 'Archivo'}
            >
              {getAttachmentIcon(att?.nombre)}
              <span className="filename">{att?.nombre || 'Archivo'}</span>
            </a>
          ))}
          {mail.adjuntos.length > 4 && (
            <span className="more-attachments">
              +{mail.adjuntos.length - 4} más
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MailCard;