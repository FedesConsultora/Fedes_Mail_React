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
    
    console.log('🧪 Enviando body:', body);

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
    if (mock) return mockEmails;          // mocks locales

    try {
      const url = new URL(`${apiBase}/sent`, window.location.origin);
      url.searchParams.set('page', page);
      url.searchParams.set('limit', limit);

      const res = await fetch(url, {
        method: 'GET',
        credentials            // 'include' en prod, 'omit' en localhost
      });

      if (!res.ok) {
        throw new Error(`❌ Error HTTP ${res.status} al obtener enviados`);
      }

      const data    = await res.json();
      const payload = data.result || data;  // admite ambos formatos

      return {
        emails: Array.isArray(payload.emails) ? payload.emails : [],
        total : typeof payload.total === 'number' ? payload.total : 0
      };

    } catch (err) {
      console.error('🚨 Error en obtenerEnviados:', err);
      return { emails: [], total: 0 };
    }
  },
  async obtenerDetalleCorreoEnviado(id) {
    console.log('[FE] → /sent_email con id', id);        // 1️⃣

    const res = await fetch('/FedesMail/api/sent_email', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body   : JSON.stringify({ mail_id: id })
    });

    console.log('[FE] status', res.status);              // 2️⃣

    const data = await res.json().catch(err => {
      console.error('[FE] ❌ json()', err);
      throw err;
    });

    console.log('[FE] payload crudo', data);             // 3️⃣

    if (data?.error) {
      console.warn('[FE] ⚠️ backend error:', data.error);
      return null;
    }
    return data.result || data;
  },

  async setState({ folder = 'inbox', mail_ids = [], state = {} }) {
    const res = await fetch('/FedesMail/api/set_state', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body   : JSON.stringify({ folder, mail_ids, state }),
    });

    if (!res.ok) throw new Error('Error al actualizar estado');
    const data = await res.json();
    if (data?.error) throw new Error(data.error);
    return data;            // → { updated: n }
  },
  async obtenerDestacados(page = 1, limit = 50) {
    const res = await fetch('/FedesMail/api/starred', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page, limit })
    });

    const data = await res.json();
    const result = data.result || data;

    return {
      emails: Array.isArray(result.emails) ? result.emails : [],
      total : typeof result.total === 'number' ? result.total : 0
    };
  },

  async deleteMails({ folder = 'inbox', mail_ids = [] } = {}) {
    console.log('[FE] 🗑️ delete →', { folder, mail_ids });

    const res = await fetch(`${apiBase}/delete`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body   : JSON.stringify({ folder, mail_ids })
    });

    console.log('[FE] status', res.status);

    const data = await res.json().catch(err => {
      console.error('[FE] ❌ json()', err);
      throw err;
    });
    console.log('[FE] payload', data);

    if (!res.ok || data?.error) {
      throw new Error(data?.error || 'Error al eliminar');
    }
    return data;                 
  },
  async obtenerEliminados(page = 1, limit = 50, search = '') {
    console.log('[FE] 🗑️ trash page', page, 'search', search);

    const body = { page, limit };
    if (search?.trim()) body.search = search.trim();

    const res = await fetch(`${apiBase}/trash`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body   : JSON.stringify(body)
    });

    const data = await res.json().catch(err => {
      console.error('[FE] ❌ json()', err);
      throw err;
    });

    const result = data.result || data;
    return {
      emails: Array.isArray(result.emails) ? result.emails : [],
      total : typeof result.total === 'number' ? result.total : 0
    };
  },
  async vaciarPapelera() {
    console.log('[FE] 🧹 vaciar papelera manualmente');

    const res = await fetch(`${apiBase}/trash/empty`, {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials
    });

    const data = await res.json().catch(err => {
      console.error('[FE] ❌ json()', err);
      throw err;
    });

    if (!res.ok || data?.error) {
      throw new Error(data?.error || 'Error al vaciar la papelera');
    }

    return data; // { deleted: n }
  },
  async restoreMails(mail_ids = []) {
    if (!Array.isArray(mail_ids) || mail_ids.length === 0) {
      throw new Error('Lista de mails vacía');
    }

    const res = await fetch(`${apiBase}/restore`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify({ mail_ids })
    });

    const data = await res.json().catch(err => {
      console.error('[FE] ❌ json()', err);
      throw err;
    });

    if (!res.ok || data?.error) {
      throw new Error(data?.error || 'Error al restaurar');
    }

    return data;  // { restored: n }
  }

};



export default api;