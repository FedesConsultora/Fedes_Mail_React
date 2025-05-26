import { useEffect, useState } from 'react';
import {
  FaChevronDown, FaChevronUp, FaChevronRight,
  FaVideo, FaMapMarkerAlt, FaPaperclip, FaFileAlt,
  FaInbox, FaChevronCircleLeft, FaChevronCircleRight
} from 'react-icons/fa';
import { useMatch, useNavigate, useParams, useLocation } from 'react-router-dom';
import SearchAndFilters from '../components/SearchAndFilters/SearchAndFilters';
import EmailToolbar from '../components/EmailToolbar';
import ReplyForwardButtons from '../components/ReplyForwardButtons';
import Loader from '../components/Loader';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import ReplyComposer from '../components/ReplyComposer';
import { useUser } from '../contexts/UserContext';

/* ——— helpers adjuntos ——— */
const fmtSize = s => (typeof s === 'string' ? s : `${(s / 1024).toFixed(0)} KB`);
const iconByMime = m => (m?.startsWith('image/') ? <FaPaperclip /> : <FaFileAlt />);

/* ——— parser ICS mínimo ——— */
async function fetchAndParseICS(url) {
  const txt = await fetch(url).then(r => r.text());

  const getVal = (k) => {
    const match = txt.match(new RegExp(`${k}(;[^:]*)?:([^\r\n]+)`));
    return match ? match[2].trim() : '';
  };

  const parseDate = (v) => {
    if (!v) return null;
    const m = v.match(/(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})?/);
    if (!m) return null;
    const [, Y, M, D, h, mi, s = '00'] = m;
    return `${Y}-${M}-${D}T${h}:${mi}:${s}`;
  };

  return {
    title: getVal('SUMMARY') || '(Sin título)',
    location: getVal('LOCATION') || '',
    url: getVal('URL') || '',
    start: parseDate(getVal('DTSTART')),
    end: parseDate(getVal('DTEND')),
    status: /STATUS:CANCELLED/.test(txt) ? 'cancelled' : ''
  };
}

export default function EmailDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const loc = useLocation();
  const { showToast, showConfirmToast } = useToast();
  const { user } = useUser();

  const fromFolder = loc.state?.from || (
    loc.pathname.includes('/sent') ? 'sent' :
    loc.pathname.includes('/trash') ? 'trash' :
    loc.pathname.includes('/spam') ? 'spam' : 'inbox'
  );
  const isSent = Boolean(useMatch('/sent/email/:id'));
  const isTrash = Boolean(useMatch('/trash/email/:id'));
  const isSpam = Boolean(useMatch('/spam/email/:id'));

  const [rootMail, setRootMail] = useState(null);
  const [thread, setThread] = useState([]);
  const [openIx, setOpenIx] = useState(null);
  const [event, setEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [composeData, setComposeData] = useState(null);

  useEffect(() => {
    const fn = isSent
      ? api.obtenerDetalleCorreoEnviado
      : isTrash
        ? api.obtenerDetalleCorreoEliminado
        : api.obtenerDetalleCorreo;

    fn(+id)
      .then(data => {
        console.log('📥 Correo raíz cargado:', data);
        console.log('📨 Hilo completo recibido:', data.thread);

        setRootMail(data);
        const th = Array.isArray(data.thread) && data.thread.length ? data.thread : [data];
        setThread(th);
        setOpenIx(th.length - 1);
      })
      .catch(err => {
        console.error('❌ Error al obtener detalle de correo:', err);
        showToast({ message: '❌ No se pudo cargar el correo', type: 'error' });
      });
  }, [id, isSent, isTrash, showToast]);

  useEffect(() => {
    if (openIx == null || !thread.length) return;
    console.log('📨 Mensaje actualmente abierto en el hilo:', thread[openIx]);
  }, [openIx, thread]);

  useEffect(() => {
    if (openIx == null || !thread.length) { setEvent(null); return; }

    (async () => {
      const m = thread[openIx];
      const ics = m.attachments?.find(a => a.mimetype === 'text/calendar' || a.name?.toLowerCase().endsWith('.ics'));
      if (!ics) { setEvent(null); return; }
      try { setEvent(await fetchAndParseICS(ics.preview)); }
      catch { setEvent(null); }
    })();
  }, [thread, openIx]);

  const insertarRespuestaEnHilo = nuevoMensaje => {
    setThread(prev => [...prev, nuevoMensaje]);
    setOpenIx(prev => prev + 1); // se posiciona en el nuevo mensaje
  };

  const totalMsgs = thread.length;
  const prevMsg = () => setOpenIx(i => (i > 0 ? i - 1 : i));
  const nextMsg = () => setOpenIx(i => (i < totalMsgs - 1 ? i + 1 : i));

  const toggleRead = async nuevo => {
    try {
      await api.setState({ folder: fromFolder, mail_ids: [rootMail.id], state: { is_read: nuevo } });
      setRootMail(m => ({ ...m, is_read: nuevo, state: nuevo ? 'read' : 'unread' }));
    } catch { showToast({ message: '❌ No se pudo actualizar', type: 'error' }); }
  };

  const restoreFromTrash = async () => {
    try { await api.restoreMails([rootMail.id]); nav('/'); }
    catch { showToast({ message: '❌ No se pudo restaurar', type: 'error' }); }
  };

  const removeFromSpam = () => {
    if (!rootMail) return;
    showConfirmToast({
      message: '¿Mover este correo a Recibidos?',
      type: 'warning',
      confirmText: 'Mover',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try { await api.marcarComoNoSpam([rootMail.id]); nav('/'); }
        catch { showToast({ message: '❌ No se pudo mover', type: 'error' }); }
      }
    });
  };

  const handleReply = async () => {
    const currentMail = thread[openIx];
    if (!currentMail?.id || (!isSent && !user?.email)) {
      showToast({ message: '❌ No se puede responder: datos incompletos', type: 'error' });
      return;
    }

    try {
      const srv = isSent
        ? api.prepareReplySent
        : isTrash
          ? api.prepareReplyTrash
          : api.prepareReply;

      const base = isSent
        ? await srv(currentMail.id)
        : isTrash
          ? await srv(currentMail.id)
          : await srv(currentMail.id, user.email);

      if (base?.error) {
        showToast({ message: `❌ ${base.error}`, type: 'error' });
        return;
      }

      setComposeData({
        to: base.destinatario,
        subject: base.asunto,
        body: base.cuerpo_html,
        tipo: 'respuesta',
        responde_a_id: currentMail.id,
      });
    } catch (error) {
      console.error('🔥 Error en handleReply:', error);
      showToast({ message: '❌ Error al preparar la respuesta', type: 'error' });
    }
  };

  const handleForward = async () => {
    const currentMail = thread[openIx];
    if (!currentMail?.id || (!isSent && !user?.email)) {
      showToast({ message: '❌ No se puede reenviar: datos incompletos', type: 'error' });
      return;
    }

    try {
      const srv = isSent
        ? api.prepareForwardSent
        : isTrash
          ? api.prepareForwardTrash
          : api.prepareForward;

      const base = isSent
        ? await srv(currentMail.id)
        : isTrash
          ? await srv(currentMail.id)
          : await srv(currentMail.id, user.email);

      if (base?.error) {
        showToast({ message: `❌ ${base.error}`, type: 'error' });
        return;
      }

      setComposeData({
        to: '',
        subject: base.asunto,
        body: base.cuerpo_html,
        attachments: base.adjuntos || [],
        tipo: 'reenviar',
        responde_a_id: currentMail.id,
      });
    } catch (error) {
      console.error('🔥 Error en handleForward:', error);
      showToast({ message: '❌ Error al preparar el reenvío', type: 'error' });
    }
  };

  const handleCloseComposer = () => {
    const el = document.querySelector('.reply-composer-wrapper');
    if (el) {
      el.classList.add('closing');
      setTimeout(() => setComposeData(null), 250);
    } else {
      setComposeData(null);
    }
  };

  if (!rootMail) return <Loader message="Cargando correo…" />;

  const Adjuntos = ({ list = [] }) => list.length ? (
    <div className="email-attachments">
      <h4>Archivos adjuntos</h4>
      <div className="attachments-list">
        {list.map((att, i) => (
          <a key={i} className="attachment-item" href={att.preview} download={att.name} rel="noopener noreferrer">
            <div className="attachment-icon">{iconByMime(att.mimetype)}</div>
            <div className="attachment-info">
              <span className="attachment-name">{att.name}</span>
              <span className="attachment-size">{fmtSize(att.size)}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  ) : null;

  const MiniHeader = (m, idx) => (
    <div key={m.id} className={`thread-mini ${idx === openIx ? 'open' : ''}`} onClick={() => setOpenIx(idx)}>
      {idx === openIx ? <FaChevronDown className="chevron" /> : <FaChevronRight className="chevron" />}
      <span className="from">{m.senderName || m.senderEmail}</span>
      <span className="date">{m.date}</span>
    </div>
  );

  const FullMessage = (m, idx) => (
    <div key={m.id} className="thread-msg">
      <div className="sender-row">
        <img src={m.avatar || 'https://www.gravatar.com/avatar?d=mp'} alt="avatar" className="profile-pic" />
        <div className="sender-info">
          <span className="email-sender">{m.senderEmail}</span>
          <div className="para-line">
            <span>Para: {m.recipients}</span>
            <button className="toggle-details" onClick={() => setDetailsOpen(o => !o)}>
              {detailsOpen ? <FaChevronUp /> : <FaChevronDown />}
            </button>
          </div>
          {detailsOpen && (
            <div className="mail-details-dropdown">
              <p><b>De:</b> {m.senderName} &lt;{m.senderEmail}&gt;</p>
              <p><b>Para:</b> {m.recipients}</p>
              {m.cc && (
                <p><b>CC:</b> {m.cc}</p>
              )}
              {/* El CCO solo se muestra si el usuario actual es el remitente */}
              {m.cco && m.senderEmail === user.email && (
                <p><b>CCO:</b> {m.cco}</p>
              )}
              <p><b>Fecha:</b> {m.date}</p>
              <p><b>Seguridad:</b> {m.security}</p>
            </div>
          )}
        </div>
      </div>

      {idx === openIx && event && (
        <div className={`calendar-event ${event.status}`}>
          <div className="calendar-date">
            <span className="day">{new Date(event.start).getDate()}</span>
            <span className="month">{new Date(event.start).toLocaleString('es-AR', { month: 'short' })}</span>
            <span className="week">{new Date(event.start).toLocaleDateString('es-AR', { weekday: 'short' })}</span>
          </div>
          <div className="calendar-info">
            <div className="title">{event.title}</div>
            {event.status === 'cancelled' && <div className="status"><b>Se canceló</b> este evento.</div>}
            {event.location && <div className="location"><FaMapMarkerAlt /> {event.location}</div>}
            {event.url && (
              <a className="join-button" href={event.url} target="_blank" rel="noopener noreferrer">
                <FaVideo /> Unirse a la videollamada
              </a>
            )}
          </div>
        </div>
      )}

      <div className="email-body" dangerouslySetInnerHTML={{ __html: m.body }} />
      <Adjuntos list={m.attachments} />
    </div>
  );

  return (
    <div className="inboxContainer">
      <SearchAndFilters />
      <EmailToolbar
        mailId={rootMail.id}
        isRead={rootMail.is_read}
        onArchive={!isTrash && !isSpam ? () => alert('Archivar') : undefined}
        onToggleRead={!isTrash && !isSpam ? toggleRead : undefined}
        onRestore={isTrash ? restoreFromTrash : isSpam ? removeFromSpam : undefined}
        restoreIcon={isSpam ? <FaInbox /> : undefined}
        restoreTitle={isSpam ? 'Mover a Recibidos' : 'Restaurar correo'}
      />
      {totalMsgs > 1 && (
        <div className="thread-nav">
          <button onClick={prevMsg} disabled={openIx === 0}><FaChevronCircleLeft /></button>
          <span>{openIx + 1} / {totalMsgs}</span>
          <button onClick={nextMsg} disabled={openIx === totalMsgs - 1}><FaChevronCircleRight /></button>
        </div>
      )}
      <div className="email-detail">
        <h2 className="subject">{rootMail.subject}</h2>
        {thread.map((m, idx) => idx === openIx ? FullMessage(m, idx) : MiniHeader(m, idx))}
        {!composeData && (
          <div className="reply-forward-wrapper visible">
            <ReplyForwardButtons onReply={handleReply} onForward={handleForward} />
          </div>
        )}
      </div>
      {composeData && (
        <ReplyComposer 
          data={composeData} 
          onClose={handleCloseComposer}
          onSuccess={nuevo => {
            insertarRespuestaEnHilo(nuevo);
            setComposeData(null);
          }}  
        />
      )}
    </div>
  );
}
