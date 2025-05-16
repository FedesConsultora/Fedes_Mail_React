/*  src/services/api.js  */
import mockUsuario from '../mocks/mockUsuario';
import mockEmails  from '../mocks/mockEmails';

/* --------------------------------------------------------
   Config dinámico
-------------------------------------------------------- */
const getApiConfig = () => {
  const ORIGIN = window.location.origin;
  return ORIGIN.includes('localhost')
    ? { apiBase: '/api',           credentials: 'omit',    mock: true  }
    : { apiBase: '/FedesMail/api', credentials: 'include', mock: false };
};

const { apiBase, credentials, mock } = getApiConfig();

/* --------------------------------------------------------
   Helpers genéricos  (👈  AHORA VAN PRIMERO)
-------------------------------------------------------- */
const ok     = (extra = {}) => ({ success: true, ...extra });

const toJson = (res) =>
  res
    .json()
    .catch(() => ({}));                     // evita crash si no hay JSON

const ensure = async (res) => {
  const data = await toJson(res);
  if (!res.ok || data?.error) {
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data?.result ?? data; 
};

/* --------------------------------------------------------
   API pública
-------------------------------------------------------- */
const api = {
  /* ---------- Usuario ---------- */
  async obtenerUsuarioActual() {
    if (mock) return mockUsuario;

    const res = await fetch(`${apiBase}/usuario_actual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify({})
    });

    return await ensure(res); 
  },

  /* ---------- Inbox ---------- */
  async obtenerInbox(email, page = 1, limit = 50) {
    if (mock) return mockEmails;

    const res = await fetch(`${apiBase}/inbox`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify({ email, page, limit })
    });
    const { emails = [], total = 0 } = await ensure(res);
    return { emails, total };
  },

  async obtenerDetalleCorreo(id) {
    if (mock) return mockEmails.emails.find(m => m.id === id);

    const res = await fetch(`${apiBase}/email`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify({ mail_id:Number(id) })
    });
    return await ensure(res);
  },

  /* ---------- Enviar ---------- */
  async enviarCorreo({ to, subject, html, text }) {
    const body = {
      destinatario: to,
      asunto     : subject,
      cuerpo_html: html,
      cuerpo_text: text || html.replace(/<[^>]*>/g, '')
    };

    const res  = await fetch(`${apiBase}/enviar_correo`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify(body)
    });

    const data = await toJson(res);
    return data?.status === 'ok'
      ? ok()
      : { success:false, error:data?.mensaje || 'Error desconocido' };
  },

  /* ---------- Enviados ---------- */
  async obtenerEnviados(page = 1, limit = 50) {
    if (mock) return mockEmails;

    const url = new URL(`${apiBase}/sent`, window.location.origin);
    url.searchParams.set('page', page);
    url.searchParams.set('limit', limit);

    const res = await fetch(url, { method:'GET', credentials });
    const { emails = [], total = 0 } = await ensure(res);
    return { emails, total };
  },

  async obtenerDetalleCorreoEnviado(id) {
    const res = await fetch(`${apiBase}/sent_email`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify({ mail_id:id })
    });
    return await ensure(res);
  },

  /* ---------- Estados ---------- */
  async setState({ folder='inbox', mail_ids=[], state={} }) {
    const res = await fetch(`${apiBase}/set_state`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify({ folder, mail_ids, state })
    });
    const { updated = 0 } = await ensure(res);
    return ok({ updated });
  },

  /* ---------- Destacados ---------- */
  async obtenerDestacados(page=1, limit=50) {
    const res = await fetch(`${apiBase}/starred`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ page, limit })
    });
    const { emails = [], total = 0 } = await ensure(res);
    return { emails, total };
  },

  /* ---------- Eliminar / Papelera ---------- */
  async deleteMails({ folder='inbox', mail_ids=[] } = {}) {
    const res = await fetch(`${apiBase}/delete`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify({ folder, mail_ids })
    });
    const { deleted = 0 } = await ensure(res);
    return ok({ deleted });
  },

  async obtenerEliminados(page=1, limit=50, search='') {
    const body = { page, limit, ...(search.trim() && { search:search.trim() }) };
    const res  = await fetch(`${apiBase}/trash`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify(body)
    });
    const { emails = [], total = 0 } = await ensure(res);
    return { emails, total };
  },

  async vaciarPapelera() {
    const res = await fetch(`${apiBase}/trash/empty`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials
    });
    const { deleted = 0 } = await ensure(res);
    return ok({ deleted });
  },

  async restoreMails(mail_ids = []) {
    const res = await fetch(`${apiBase}/restore`, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      credentials,
      body: JSON.stringify({ mail_ids })
    });
    const { restored = 0 } = await ensure(res);
    return ok({ restored });
  }
};

export default api;
