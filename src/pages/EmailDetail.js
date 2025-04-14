import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EmailToolbar from '../components/EmailToolbar';
import SearchAndFilters from '../components/SearchAndFilters/SearchAndFilters';
import { FaChevronDown, FaChevronUp, FaVideo, FaMapMarkerAlt } from 'react-icons/fa';

export default function EmailDetail() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [event, setEvent] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const mail = {
    subject: 'Canceled event: REU - Depto Diseño @ Wed Apr 2, 2025',
    body: '<p>Hola Enzo,<br>Este evento fue cancelado.</p>',
    senderEmail: 'sofia@fedesconsultora.com',
    senderName: 'Sofía Pietropaoli',
    recipients: 'Enzo Pinotti <epinotti@fedesconsultora.com>',
    date: '3 abr 2025, 8:05 a.m.',
    domain: 'fedesconsultora.com',
    signedBy: 'google.com',
    security: 'Encriptación estándar (TLS)',
    attachments: [
      {
        name: 'reunion-agenda.pdf',
        url: 'https://fedes.ai/media/attachments/reunion-agenda.pdf',
        size: '134 KB'
      },
      {
        name: 'planos-proyecto.png',
        url: 'https://fedes.ai/media/attachments/planos-proyecto.png',
        size: '892 KB'
      }
    ]
  };

  useEffect(() => {
    // Mock usuario desde backend
    setUser({
      name: mail.senderName,
      email: mail.senderEmail,
      image_url: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y',
      domain: mail.domain,
      signed_by: mail.signedBy,
      security: mail.security,
    });

    // Fetch evento por asunto (mockeado por ahora)
    async function fetchEvent() {
      // const res = await fetch('/api/calendar/events/from_subject', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ subject: mail.subject })
      // });
      // const data = await res.json();
      // setEvent(data[0]);

      // Mock
      setEvent({
        title: 'REU - Depto Diseño',
        start: '2025-04-02T11:30:00',
        end: '2025-04-02T12:00:00',
        status: 'cancelled',
        videocall_url: 'https://meet.google.com/xyz-abc-def',
        location: 'Sala 1 - Oficina Fedes',
      });
    }

    fetchEvent();
  }, []);

  return (
    <div className="inboxContainer">
      <SearchAndFilters />
      <EmailToolbar
        onDelete={() => alert('Eliminar')}
        onArchive={() => alert('Archivar')}
        onMarkUnread={() => alert('Marcar como no leído')}
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
