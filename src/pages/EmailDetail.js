/*  src/pages/EmailDetail.jsx  */
import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  FaChevronDown, FaChevronUp, FaVideo, FaMapMarkerAlt,
  FaPaperclip, FaFileAlt, FaInbox
} from 'react-icons/fa';
import SearchAndFilters from '../components/SearchAndFilters/SearchAndFilters';
import EmailToolbar     from '../components/EmailToolbar';
import api              from '../services/api';
import { useToast }     from '../contexts/ToastContext';

/* ───── helpers adjuntos ───── */
const fmtSize    = s => (typeof s === 'string' ? s : `${(s / 1024).toFixed(0)} KB`);
const iconByMime = m => (m?.startsWith('image/') ? <FaPaperclip /> : <FaFileAlt />);

/* ───── parser ICS mínimo ───── */
async function fetchAndParseICS (url) {
  const txt = await fetch(url).then(r => r.text());
  const g   = k => (txt.match(new RegExp(`${k}:(.+)`)) || [,''])[1].trim();
  const dt  = v => {
    const m = v.replace('Z','').match(/(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})?/);
    if (!m) return null;
    const [ ,Y,M,D,h,mi,s='00'] = m;
    return `${Y}-${M}-${D}T${h}:${mi}:${s}`;
  };
  return {
    title   : g('SUMMARY')   || '(Sin título)',
    location: g('LOCATION')  || '',
    url     : g('URL')       || '',
    start   : dt(g('DTSTART')),
    end     : dt(g('DTEND')),
    status  : /STATUS:CANCELLED/.test(txt) ? 'cancelled' : ''
  };
}

/* ─────────────────────────── */
export default function EmailDetail () {
  const { id }        = useParams();
  const location      = useLocation();
  const navigate      = useNavigate();
  const { showToast , showConfirmToast } = useToast();

  /* carpeta de origen (para volver) */
  const fromFolder = location.state?.from || (
    location.pathname.includes('/sent')  ? 'sent'  :
    location.pathname.includes('/trash') ? 'trash' :
    location.pathname.includes('/spam')  ? 'spam'  : 'inbox'
  );

  const isSent  = Boolean(useMatch('/sent/email/:id'));
  const isTrash = Boolean(useMatch('/trash/email/:id'));
  const isSpam  = Boolean(useMatch('/spam/email/:id'));

  /* ----- estado ----- */
  const [mail , setMail ] = useState(null);
  const [user , setUser ] = useState(null);
  const [event, setEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ----- fetch detalle ----- */
  useEffect(() => {
    const fn = isSent
      ? api.obtenerDetalleCorreoEnviado
      : isTrash
        ? api.obtenerDetalleCorreoEliminado
        : api.obtenerDetalleCorreo;   // spam e inbox usan el mismo

    fn(+id)
      .then(setMail)
      .catch(() => showToast({ message:'❌ No se pudo cargar el correo', type:'error' }));
  }, [id, isSent, isTrash, showToast]);

  /* ----- remitente + ICS ----- */
  useEffect(() => {
    if (!mail) return;

    setUser({
      name     : mail.senderName,
      email    : mail.senderEmail,
      domain   : mail.domain,
      signedBy : mail.signedBy,
      security : mail.security,
      avatar   : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    });

    (async () => {
      const ics = mail.attachments?.find(a =>
        a.mimetype === 'text/calendar' || a.name?.toLowerCase().endsWith('.ics')
      );
      if (!ics) { setEvent(null); return; }

      try { setEvent(await fetchAndParseICS(ics.preview)); }
      catch { setEvent(null); }
    })();
  }, [mail]);

  /* ---------- acciones ---------- */
  const toggleRead = async nuevo => {
    try {
      await api.setState({ folder: fromFolder, mail_ids:[mail.id], state:{ is_read:nuevo } });
      setMail(m => ({ ...m, is_read:nuevo, state:nuevo ? 'read' : 'unread' }));
    } catch {
      showToast({ message:'❌ No se pudo actualizar', type:'error' });
    }
  };

  const restoreFromTrash = async () => {
    try {
      await api.restoreMails([mail.id]);
      showToast({ message:'♻️ Correo restaurado', type:'success' });
      navigate('/');
    } catch {
      showToast({ message:'❌ No se pudo restaurar', type:'error' });
    }
  };

  const removeFromSpam = () => {
    if (!mail?.id) return;
    showConfirmToast({
      message    : '¿Mover este correo a Recibidos?',
      type       : 'warning',
      confirmText: 'Mover',
      cancelText : 'Cancelar',
      onConfirm  : async () => {
        try {
          await api.marcarComoNoSpam([mail.id]);
          showToast({ message:'📥 Correo movido a Recibidos', type:'success' });
          navigate('/');
        } catch {
          showToast({ message:'❌ No se pudo mover', type:'error' });
        }
      }
    });
  };

  /* ---------- loading ---------- */
  if (!mail) {
    return (
      <div className="inboxContainer">
        <p>Cargando correo…</p>
      </div>
    );
  }

  /* ---------- render ---------- */
  return (
    <div className="inboxContainer">
      <SearchAndFilters />

      <EmailToolbar
        mailId      ={mail.id}
        isRead      ={mail.is_read}
        onArchive   ={(!isTrash && !isSpam) ? () => alert('Archivar') : undefined}
        onToggleRead={!isTrash && !isSpam   ? toggleRead            : undefined}
        onRestore   ={isTrash ? restoreFromTrash
                    : isSpam  ? removeFromSpam   : undefined}
        restoreIcon ={isSpam ? <FaInbox/> : undefined}
        restoreTitle={isSpam ? 'Mover a Recibidos' : 'Restaurar correo'}
      />

      <div className="email-detail">
        <h2 className="subject">{mail.subject}</h2>

        {/* -------- remitente -------- */}
        {user && (
          <div className="sender-row">
            <img src={user.avatar} alt="" className="profile-pic" />
            <div className="sender-info">
              <span className="email-sender">{user.email}</span>

              <div className="para-line">
                <span>Para: {mail.recipients}</span>
                <button
                  className="toggle-details"
                  onClick={() => setDetailsOpen(o => !o)}
                >
                  {detailsOpen ? <FaChevronUp/> : <FaChevronDown/>}
                </button>
              </div>

              {detailsOpen && (
                <div className="mail-details-dropdown">
                  <p><b>De:</b> {user.name} &lt;{user.email}&gt;</p>
                  <p><b>Responder-a:</b> {user.email}</p>
                  <p><b>Para:</b> {mail.recipients}</p>
                  <p><b>Fecha:</b> {mail.date}</p>
                  <p><b>Enviado por:</b> {user.domain}</p>
                  <p><b>Firmado por:</b> {user.signedBy}</p>
                  <p><b>Seguridad:</b> {user.security}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* -------- evento calendario -------- */}
        {event && (
          <div className={`calendar-event ${event.status}`}>
            <div className="calendar-date">
              <span className="day">{new Date(event.start).getDate()}</span>
              <span className="month">
                {new Date(event.start).toLocaleString('es-AR', { month:'short' })}
              </span>
              <span className="week">
                {new Date(event.start).toLocaleDateString('es-AR', { weekday:'short' })}
              </span>
            </div>

            <div className="calendar-info">
              <div className="title">{event.title}</div>
              {event.status === 'cancelled' && (
                <div className="status"><b>Se canceló</b> este evento.</div>
              )}
              {event.location && (
                <div className="location"><FaMapMarkerAlt/> {event.location}</div>
              )}
              {event.url && (
                <a
                  className="join-button"
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaVideo/> Unirse a la videollamada
                </a>
              )}
            </div>
          </div>
        )}

        {/* -------- cuerpo -------- */}
        <div
          className="email-body"
          dangerouslySetInnerHTML={{ __html: mail.body }}
        />

        {/* -------- adjuntos -------- */}
        {Array.isArray(mail.attachments) && mail.attachments.length > 0 && (
          <div className="email-attachments">
            <h4>Archivos adjuntos</h4>
            <div className="attachments-list">
              {mail.attachments.map((att, i) => (
                <a
                  key={i}
                  href={att.preview}
                  download={att.name}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="attachment-item"
                >
                  <div className="attachment-icon">{iconByMime(att.mimetype)}</div>
                  <div className="attachment-info">
                    <span className="attachment-name">{att.name}</span>
                    <span className="attachment-size">{fmtSize(att.size)}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
