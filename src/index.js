// ------------------ index.js ------------------

// 1️⃣ Silenciar el OWLError “detached dom node”
window.addEventListener('error', event => {
  const err = event.error;
  if (err && err.name === 'OwlError' && err.message.includes('detached dom node')) {
    event.preventDefault();
    console.warn('⚠️ Se ignora OwlError “detached dom node”');
  }
});
window.addEventListener('unhandledrejection', event => {
  const err = event.reason;
  if (err && err.name === 'OwlError' && err.message.includes('detached dom node')) {
    event.preventDefault();
    console.warn('⚠️ Se ignora OwlError “detached dom node” (promise)');
  }
});

// 2️⃣ Tu arranque normal de React
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react_mail_app');
  if (!container) {
    console.error("❌ No se encontró el contenedor 'react_mail_app'");
    return;
  }
  // opcional: evitar intentos sobre nodos desconectados
  const tryRender = () => {
    if (container.isConnected) {
      const root = ReactDOM.createRoot(container);
      root.render(<App />);
    } else {
      setTimeout(tryRender, 50);
    }
  };
  tryRender();
});