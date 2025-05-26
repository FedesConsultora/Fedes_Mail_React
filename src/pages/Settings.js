import { useEffect, useState } from 'react';
import Loader from '../components/Loader';

export default function Settings() {
  const [firma, setFirma] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/FedesMail/api/usuario_actual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(data => {
        setFirma(data.firma_html || '');
        setLoading(false);
      })
      .catch(() => {
        setMensaje('⚠️ Error al cargar la firma');
        setLoading(false);
      });
  }, []);

  const guardarFirma = () => {
    setMensaje('');
    fetch('/FedesMail/api/actualizar_firma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firma_html: firma }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.status === 'ok') setMensaje('✅ Firma actualizada correctamente.');
        else setMensaje('❌ Error al actualizar firma.');
      })
      .catch(() => setMensaje('❌ Error de conexión al guardar.'));
  };

  if (loading) return <Loader message="Cargando ajustes…" />;

  return (
    <div className="settings-container">
      <h2>⚙️ Configuraciones</h2>
      <div className="settings-block">
        <label htmlFor="firma">✍️ Firma del correo (HTML):</label>
        <textarea
          id="firma"
          value={firma}
          onChange={(e) => setFirma(e.target.value)}
          rows={8}
          placeholder="<p>Saludos,<br>Tu nombre</p>"
        />
        <button className="guardar-btn" onClick={guardarFirma}>
          💾 Guardar firma
        </button>
        {mensaje && <p className="mensaje">{mensaje}</p>}
        <div className="firma-preview">
          <p className="preview-label">👀 Vista previa:</p>
          <div
            className="preview-box"
            dangerouslySetInnerHTML={{ __html: firma }}
          />
        </div>
      </div>
    </div>
  );
}