import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRegStar, FaStar, FaTrash, FaArchive, FaEnvelope } from 'react-icons/fa';
import {
  AiFillFilePdf,
  AiFillFileImage,
  AiFillFileWord,
  AiFillFileExcel,
  AiFillFile
} from 'react-icons/ai';

const MailCard = ({ mail, selected, onToggle }) => {
  const navigate = useNavigate();

  const isToday = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isToday(dateStr)
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  const handleClick = (e) => {
    const isInteractive = e.target.closest('input, button, .attachment-pill, .hover-actions');
    if (!isInteractive) navigate(`/email/${mail.id}`);
  };

  const getAttachmentIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return <AiFillFilePdf className="file-icon" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) return <AiFillFileImage className="file-icon" />;
    if (['doc', 'docx'].includes(ext)) return <AiFillFileWord className="file-icon" />;
    if (['xls', 'xlsx', 'csv'].includes(ext)) return <AiFillFileExcel className="file-icon" />;
    return <AiFillFile className="file-icon" />;
  };

  return (
    <div className={`mail-card ${mail.state}`} onClick={handleClick}>
      <div className="mail-row">
        <input type="checkbox" checked={selected} onChange={onToggle} />
        <button className="starBtn" title="Destacar">
          {mail.favorite ? <FaStar /> : <FaRegStar />}
        </button>

        <div className="mail-info">
          <strong className="mail-sender">{mail.de}</strong>
          <span className="mail-subject">{mail.asunto}</span>
          <span
            className="mail-snippet"
            dangerouslySetInnerHTML={{ __html: mail.contenido?.slice(0, 80) }}
          />
        </div>

        <span className="mail-date">{formatDate(mail.fecha)}</span>

        <div className="hover-actions">
          <button title="Eliminar">
            <FaTrash />
          </button>
          <button title="Archivar">
            <FaArchive />
          </button>
          <button title="Marcar como no leído" className="unread-icon">
            <FaEnvelope />
            <span className="dot" />
          </button>
        </div>
      </div>

      {mail.adjuntos?.length > 0 && (
        <div className="mail-attachment-row">
          {mail.adjuntos.slice(0, 4).map((att, idx) => (
            <a
              key={idx}
              href={att.url || '#'}
              className="attachment-pill"
              target="_blank"
              rel="noopener noreferrer"
              title={att.nombre}
            >
              {getAttachmentIcon(att.nombre)}
              <span className="filename">{att.nombre}</span>
            </a>
          ))}
          {mail.adjuntos.length > 4 && (
            <span className="more-attachments">+{mail.adjuntos.length - 4} más</span>
          )}
        </div>
      )}
    </div>
  );
};

export default MailCard;
