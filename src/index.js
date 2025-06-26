import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('react_mail_app');
  if (!container) {
    console.error("❌ No se encontró el contenedor 'react_mail_app'");
  } else {
    const root = ReactDOM.createRoot(container);
    root.render(<App />);
  }
});