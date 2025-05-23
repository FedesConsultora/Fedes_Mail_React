import { useEffect, useState } from 'react';
import ComposeModal from './ComposeModal';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';

export default function ReplyComposer({ onClose, data }) {
  const { showToast } = useToast();
  const [preloaded, setPreloaded] = useState([]); 

  const handleSend = async ({ to, subject, body, attachments }) => {
    const { success, error } = await api.enviarCorreo({
      to,
      cc: '',
      cco: '',
      subject,
      html: body,
      text: body,
      attachments,
      tipo: data.tipo,
      responde_a_id: data.responde_a_id,
    });

    if (success) {
      showToast({ message: '📨 Correo enviado', type: 'success' });
      onClose();
    } else {
      showToast({ message: `❌ ${error}`, type: 'error' });
    }
  };

  // ✅ Preprocesa los adjuntos si vienen desde el forward
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

  const blobToB64 = (blob) =>
    new Promise(res => {
      const r = new FileReader();
      r.onload = () => res(r.result.split(',')[1]);
      r.readAsDataURL(blob);
    });

  return (
    <div className="reply-composer-wrapper">
      <ComposeModal
        modo="respuesta"
        initialData={data}
        preloadedFiles={preloaded}
        onSend={handleSend}
        onClose={onClose}
      />
    </div>
  );
}
