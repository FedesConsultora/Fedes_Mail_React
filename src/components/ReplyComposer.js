import { useEffect, useState } from 'react';
import ComposeModal from './ComposeModal';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';
import { FaTimes, FaMinus, FaWindowMaximize, FaReply, FaShare } from 'react-icons/fa';
import api from '../services/api';

export default function ReplyComposer({ onClose, data, onSuccess }) {
  const { showToast } = useToast();
  const { user } = useUser();

  const [preloaded, setPreloaded] = useState([]);
  const [minimized, setMinimized] = useState(false);
  const [wasMinimized, setWasMinimized] = useState(false);
  const [mostrarFirma, setMostrarFirma] = useState(true);

  const isReply = data?.tipo === 'respuesta';
  const isForward = data?.tipo === 'reenviar';

  const handleSend = async ({ to, cc, cco, subject, body, attachments }) => {
    const { success, error } = await api.enviarCorreo({
      to,
      cc,
      cco,
      subject,
      html: body,
      text: body,
      attachments,
      tipo: data.tipo,
      responde_a_id: data.responde_a_id,
    });

    if (success) {
      showToast({ message: '📨 Correo enviado', type: 'success' });

      if (typeof onSuccess === 'function') {
        const now = new Date();
        onSuccess({
          id: Math.floor(Math.random() * 1000000),
          subject,
          body,
          senderEmail: user.email,
          senderName: user.nombre,
          recipients: to,
          date: now.toLocaleString('es-AR', {
            dateStyle: 'medium',
            timeStyle: 'short',
          }),
          avatar: user.imagen_avatar
            ? `data:image/jpeg;base64,${user.imagen_avatar}`
            : undefined,
          attachments: [],
        });
      }

      onClose();
    } else {
      showToast({ message: `❌ ${error}`, type: 'error' });
    }
  };

  useEffect(() => {
    if (!data?.attachments?.length) return;
    (async () => {
      const files = [];
      for (const a of data.attachments) {
        try {
          const blob = await fetch(a.url || a.preview).then(r => r.blob());
          const base64 = await blobToB64(blob);
          const file = new File([blob], a.nombre, { type: a.mimetype });
          files.push({ file, base64, url: a.url || a.preview });
        } catch (e) {
          console.warn('❌ Error al procesar adjunto:', a.nombre, e);
        }
      }
      setPreloaded(files);
    })();
  }, [data]);

  const blobToB64 = blob =>
    new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.readAsDataURL(blob);
    });

  const toggleMinimize = () => {
    if (minimized) {
      setWasMinimized(true);
      setTimeout(() => setWasMinimized(false), 500);
    }
    setMinimized(m => !m);
  };

  const avatar = user?.imagen_avatar
    ? `data:image/jpeg;base64,${user.imagen_avatar}`
    : 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y';

  return (
    <div className={`reply-composer-wrapper ${minimized ? 'minimized' : ''}`}>
      <div className="composer-header">
        <div className="user-avatar-block">
          <img src={avatar} alt={user?.nombre || 'avatar'} className="user-avatar" />
          <div className="reply-icon-wrapper">
            {isReply && <FaReply className="reply-icon" title="Respuesta" />}
            {isForward && <FaShare className="reply-icon" title="Reenvío" />}
          </div>
        </div>
        <h3>{data.subject || '(Sin asunto)'}</h3>
        <div className="iconosComposer">
          <button className="icon-btn" onClick={toggleMinimize} title="Minimizar / Restaurar">
            {minimized ? <FaWindowMaximize /> : <FaMinus />}
          </button>
          <button className="icon-btn close-button" onClick={onClose} title="Cerrar">
            <FaTimes />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          <ComposeModal
            className={wasMinimized ? 'embedded restore-animation' : 'embedded'}
            modo="respuesta"
            initialData={{
              ...data,
              body: data.body || '',
            }}
            preloadedFiles={preloaded}
            onSend={handleSend}
            onClose={onClose}
            mostrarFirma={mostrarFirma}
            setMostrarFirma={setMostrarFirma}
          />

          

          {data.body && (
            <div className="original-message-preview scrollable-html">
              <div dangerouslySetInnerHTML={{ __html: data.body }} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
