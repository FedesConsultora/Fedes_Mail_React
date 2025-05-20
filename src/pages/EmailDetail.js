import { useEffect, useState } from 'react';
import { useMatch, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  FaChevronDown, FaChevronUp, FaVideo, FaMapMarkerAlt,
  FaPaperclip, FaFileAlt
} from 'react-icons/fa';
import EmailToolbar      from '../components/EmailToolbar';
import SearchAndFilters  from '../components/SearchAndFilters/SearchAndFilters';
import api               from '../services/api';
import { useToast }      from '../contexts/ToastContext';

/* ─── helpers para adjuntos ────────────────────────────────────────── */
const fmtSize = kb => `${kb.replace(' KB','')} KB`;

const iconByMime = m => m?.startsWith('image/')
  ? <FaPaperclip/> : <FaFileAlt/>;

/* ──────────────────────────────────────────────────────────────────── */
export default function EmailDetail () {
  /* ---------- hooks ---------- */
  const { id }          = useParams();              // id numérico
  const location        = useLocation();
  const fromFolder      = location.state?.from || 'inbox';
  const nav             = useNavigate();
  const { showToast }   = useToast();

  const isSent  = Boolean(useMatch('/sent/email/:id'));
  const isTrash = Boolean(useMatch('/trash/email/:id'));

  /* ---------- estado ---------- */
  const [mail , setMail ] = useState(null);
  const [user , setUser ] = useState(null);
  const [event, setEvent] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  /* ---------- GET detalle ---------- */
  useEffect(() => {
    const fn = isSent
      ? api.obtenerDetalleCorreoEnviado
      : isTrash
        ? api.obtenerDetalleCorreoEliminado
        : api.obtenerDetalleCorreo;

    fn(+id)
      .then(setMail)
      .catch(e=>{
        console.error(e);
        showToast({message:'❌ No se pudo cargar el correo',type:'error'});
      });
  }, [id,isSent,isTrash,showToast]);

  /* ---------- normalizar datos remitente & mock evento ---------- */
  useEffect(() => {
    if(!mail) return;

    setUser({
      name     : mail.senderName,
      email    : mail.senderEmail,
      domain   : mail.domain,
      signedBy : mail.signedBy,
      security : mail.security,
      avatar   : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'
    });

    /*  Sólo mock hasta que llegue un parser de ICS: */
    if(mail.subject?.toLowerCase().includes('reu')){
      setEvent({
        title  : 'REU - Depto Diseño',
        start  : '2025-04-02T11:30:00',
        end    : '2025-04-02T12:00:00',
        status : 'cancelled',
        videocall_url : 'https://meet.google.com/xyz-abc-def',
        location      : 'Sala 1 - Oficina Fedes',
      });
    } else { setEvent(null); }
  }, [mail]);

  /* ---------- callbacks toolbar ---------- */
  const toggleRead = async (nuevo) => {
    try {
      await api.setState({folder:fromFolder, mail_ids:[mail.id], state:{is_read:nuevo}});
      setMail(m=>({...m,is_read:nuevo,state:nuevo?'read':'unread'}));
    } catch(e){
      showToast({message:'❌ No se pudo actualizar',type:'error'});
    }
  };

  const restore = async () => {
    try{
      await api.restoreMails([mail.id]);
      showToast({message:'♻️ Correo restaurado',type:'success'});
      nav(`/${fromFolder}`);
    }catch(e){
      showToast({message:'❌ No se pudo restaurar',type:'error'});
    }
  };

  /* ---------- loading ---------- */
  if(!mail){
    return(<div className="inboxContainer"><p>Cargando correo…</p></div>);
  }

  /* ---------- render ---------- */
  return (
    <div className="inboxContainer">
      <SearchAndFilters/>

      <EmailToolbar
        mailId={mail.id}
        isRead={mail.is_read}
        onToggleRead={!isTrash ? toggleRead : undefined}
        onArchive   ={!isTrash ? ()=>alert('Archivar') : undefined}
        onRestore   ={ isTrash ? restore       : undefined}
      />

      <div className="email-detail">
        <h2 className="subject">{mail.subject}</h2>

        {/* -------- remitente -------- */}
        {user && (
          <div className="sender-row">
            <img src={user.avatar} alt="" className="profile-pic"/>
            <div className="sender-info">
              <span className="email-sender">{user.email}</span>
              <div className="para-line">
                <span>Para: {mail.recipients}</span>
                <button
                  className="toggle-details"
                  onClick={()=>setDetailsOpen(o=>!o)}
                  aria-label="toggle details"
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

        {/* -------- bloque evento (opcional) -------- */}
        {event && (
          <div className={`calendar-event ${event.status}`}>
            <div className="calendar-date">
              <span className="day">{new Date(event.start).getDate()}</span>
              <span className="month">{new Date(event.start).toLocaleString('es-AR',{month:'short'})}</span>
              <span className="week">{new Date(event.start).toLocaleDateString('es-AR',{weekday:'short'})}</span>
            </div>
            <div className="calendar-info">
              <div className="title">{event.title}</div>
              {event.status==='cancelled' && <div className="status"><b>Se canceló</b> este evento.</div>}
              {event.location && <div className="location"><FaMapMarkerAlt/> {event.location}</div>}
              {event.videocall_url && (
                <a className="join-button" href={event.videocall_url} target="_blank" rel="noopener noreferrer">
                  <FaVideo/> Unirse a la videollamada
                </a>
              )}
            </div>
          </div>
        )}

        {/* -------- cuerpo html -------- */}
        <div className="email-body" dangerouslySetInnerHTML={{__html:mail.body}}/>

        {/* -------- adjuntos -------- */}
        {Array.isArray(mail.attachments) && mail.attachments.length>0 && (
          <div className="email-attachments">
            <h4>Archivos adjuntos</h4>
            <div className="attachments-list">
              {mail.attachments.map((att,i)=>(
                <a
                  key={i}
                  href={att.preview}                /* inline para ver / navegador decide */
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