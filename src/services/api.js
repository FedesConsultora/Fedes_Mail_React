import mockUsuario from '../mocks/mockUsuario';
import mockEmails from '../mocks/mockEmails';

const getApiConfig = () => {
  const ORIGIN = window.location.origin;

  if (ORIGIN.includes('localhost')) {
    return {
      apiBase: '/api',
      credentials: 'omit',
      mock: true
    };
  }

  return {
    apiBase: '/FedesMail/api',
    credentials: 'include',
    mock: false
  };
};

const { apiBase, credentials, mock } = getApiConfig();

const api = {
  async obtenerUsuarioActual() {
    if (mock) return mockUsuario;
  
    try {
      console.log('🧠 obteniendo usuario actual...', apiBase, credentials);
  
      const res = await fetch(`${apiBase}/usuario_actual`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({})
      });
  
      if (!res.ok) {
        throw new Error(`❌ Error HTTP ${res.status} al obtener usuario`);
      }
  
      const data = await res.json();
      console.log('📦 Usuario recibido:', data);
      const usuario = data?.result || data; 
  
      if (
        !usuario ||
        typeof usuario !== 'object' ||
        typeof usuario.nombre !== 'string' ||
        typeof usuario.email !== 'string'
      ) {
        console.warn('⚠️ Usuario inválido:', usuario);
        return null;
      }
  
      return usuario;
  
    } catch (err) {
      console.error('🚨 Error en obtenerUsuarioActual:', err);
      return null;
    }
  },

  async obtenerInbox(emailUsuario, page = 1, limit = 50) {
    if (!emailUsuario || typeof emailUsuario !== 'string') {
      console.error('❌ Email de usuario inválido al obtener inbox:', emailUsuario);
      return { emails: [], total: 0 };
    }

    if (mock) return mockEmails;

    try {
      console.log('📩 obteniendo inbox...', apiBase, credentials);

      const res = await fetch(`${apiBase}/inbox`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ email: emailUsuario, page, limit })
      });

      if (!res.ok) {
        throw new Error(`❌ Error HTTP ${res.status} al obtener inbox`);
      }

      const data = await res.json();
      const { result } = data;

      if (
        !result ||
        !Array.isArray(result.emails) ||
        typeof result.total !== 'number'
      ) {
        console.warn('⚠️ Respuesta inválida de inbox:', data);
        return { emails: [], total: 0 };
      }

      return result;

    } catch (err) {
      console.error('🚨 Error en obtenerInbox:', err);
      return { emails: [], total: 0 };
    }
  },
  async obtenerDetalleCorreo(id) {
    if (mock) {
      const mails = Array.isArray(mockEmails.emails) ? mockEmails.emails : [];
      return mails.find((m) => m.id === id);
    }
  
    try {
      const res = await fetch(`${apiBase}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials,
        body: JSON.stringify({ mail_id: Number(id) })
      });
  
      if (!res.ok) {
        throw new Error(`❌ Error HTTP ${res.status} al obtener detalle del correo`);
      }
  
      const data = await res.json();
  
      if (data?.error) {
        console.warn('⚠️ Error recibido del backend:', data.error);
        return null;
      }
  
      return data?.result || data;
  
    } catch (err) {
      console.error('🚨 Error en obtenerDetalleCorreo:', err);
      return null;
    }
  },
  async enviarCorreo({ to, subject, html, text }) {
    const body = {
      destinatario: to,
      asunto: subject,
      cuerpo_html: html,
      cuerpo_text: text || html.replace(/<[^>]*>/g, ''),
    };

    const res = await fetch(`${apiBase}/enviar_correo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data?.status === 'ok'
      ? { success: true }
      : { success: false, error: data?.mensaje || 'Error desconocido' };
  },

  async obtenerEnviados(page = 1, limit = 50) {
    if (mock) return { emails: [], total: 0 };      

    const res = await fetch(`${apiBase}/sent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify({ page, limit }),
    });

    const data = await res.json();
    return data?.result || { emails: [], total: 0 };
  }
};

export default api;