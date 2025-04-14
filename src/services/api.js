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

    const res = await fetch(`${apiBase}/usuario_actual`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify({})
    });
    if (!res.ok) throw new Error('Error obteniendo usuario');
    return await res.json();
  },

  async obtenerInbox(emailUsuario, page = 1, limit = 50) {
    if (mock) return mockEmails;

    const res = await fetch(`${apiBase}/inbox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials,
      body: JSON.stringify({ email: emailUsuario, page, limit })
    });
    if (!res.ok) throw new Error('Error obteniendo inbox');
    return await res.json();
  }
};

export default api;
