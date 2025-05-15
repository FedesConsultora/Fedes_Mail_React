import React, { useEffect, useState } from 'react';
import { useMatch, useParams  } from 'react-router-dom';
import EmailToolbar from '../components/EmailToolbar';
import SearchAndFilters from '../components/SearchAndFilters/SearchAndFilters';
import { FaChevronDown, FaChevronUp, FaVideo, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../services/api';

export default function EmailDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [mail, setMail] = useState(null);
  const matchSent = useMatch('/sent/email/:id');
  const isSent = Boolean(matchSent);
  
  async function toggleLecturaDetalle() {
    try {
      const nuevoEstado = !mail.is_read;
      await api.setState({
        folder: 'inbox',
        mail_ids: [mail.id],
        state: { is_read: nuevoEstado }
      });

      setMail((prev) => ({
        ...prev,
        is_read: nuevoEstado,
        state: nuevoEstado ? 'read' : 'unread'
      }));
    } catch (err) {
      console.error('❌ Error al cambiar estado en detalle:', err);
      alert('No se pudo cambiar el estado del correo.');
    }
  }

  useEffect(() => {
    const obtener = isSent ? api.obtenerDetalleCorreoEnviado
                          : api.obtenerDetalleCorreo;

    obtener(+id).then(m => {
        console.log('[EmailDetail] setMail', m);
        setMail(m);
    })
    .catch(err => console.error('❌ detalle:', err));
  }, [id, isSent]);

  useEffect(() => {
    if (!mail) return;

    setUser({
      name: mail.senderName,
      email: mail.senderEmail,
      image_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      domain: mail.domain,
      signed_by: mail.signedBy,
      security: mail.security,
    });

    // Mock: en el futuro podrías traer el evento real por asunto
    setEvent({
      title: 'REU - Depto Diseño',
      start: '2025-04-02T11:30:00',
      end: '2025-04-02T12:00:00',
      status: 'cancelled',
      videocall_url: 'https://meet.google.com/xyz-abc-def',
      location: 'Sala 1 - Oficina Fedes',
    });
  }, [mail]);

  if (!mail) {
    return <div className="inboxContainer">Cargando correo...</div>;
  }

  return (
    <div className="inboxContainer">
      <SearchAndFilters />
      <EmailToolbar
        onDelete={() => alert('Eliminar')}
        onArchive={() => alert('Archivar')}
        onMarkUnread={toggleLecturaDetalle}
        isRead={mail.is_read}
      />

      <div className="email-detail">
        <h2 className="subject">{mail.subject}</h2>

        {user && (
          <div className="sender-row">
            <img src={user.image_url} alt="Remitente" className="profile-pic" />
            <div className="sender-info">
              <span className="email-sender">{user.email}</span>
              <div className="para-line">
                <span>Para: {mail.recipients}</span>
                <button className="toggle-details" onClick={() => setShowDetails(prev => !prev)}>
                  {showDetails ? <FaChevronUp /> : <FaChevronDown />}
                </button>
              </div>

              {showDetails && (
                <div className="mail-details-dropdown">
                  <p><strong>De:</strong> {user.name} &lt;{user.email}&gt;</p>
                  <p><strong>Responder a:</strong> {user.name} &lt;{user.email}&gt;</p>
                  <p><strong>Para:</strong> {mail.recipients}</p>
                  <p><strong>Fecha:</strong> {mail.date}</p>
                  <p><strong>Asunto:</strong> {mail.subject}</p>
                  <p><strong>Enviado por:</strong> {user.domain}</p>
                  <p><strong>Firmado por:</strong> {user.signed_by}</p>
                  <p><strong>Seguridad:</strong> {user.security}</p>
                  <p className="important">⚠️ Por alguna razón, Google lo identificó como importante.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {event && (
          <div className={`calendar-event ${event.status}`}>
            <div className="calendar-date">
              <span className="day">{new Date(event.start).getDate()}</span>
              <span className="month">{new Date(event.start).toLocaleString('default', { month: 'short' })}</span>
              <span className="week">{new Date(event.start).toLocaleDateString('es-AR', { weekday: 'short' })}</span>
            </div>
            <div className="calendar-info">
              <div className="title">{event.title}</div>
              <div className="source">De Calendario de Odoo</div>
              {event.status === 'cancelled' && (
                <div className="status"><b>Se canceló</b> este evento.</div>
              )}
              {event.location && (
                <div className="location"><FaMapMarkerAlt /> {event.location}</div>
              )}
              {event.videocall_url && (
                <a className="join-button" href={event.videocall_url} target="_blank" rel="noopener noreferrer">
                  <FaVideo /> Unirse a la videollamada
                </a>
              )}
            </div>
          </div>
        )}

        <div
          className="email-body"
          dangerouslySetInnerHTML={{ __html: mail.body }}
        />
      </div>

      {mail.attachments && mail.attachments.length > 0 && (
        <div className="email-attachments">
          <h4>Archivos adjuntos</h4>
          <div className="attachments-list">
            {mail.attachments.map((att, idx) => (
              <a
                key={idx}
                href={att.url}
                download={att.name}
                className="attachment-item"
              >
                <div className="attachment-icon">📎</div>
                <div className="attachment-info">
                  <span className="attachment-name">{att.name}</span>
                  <span className="attachment-size">{att.size}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
