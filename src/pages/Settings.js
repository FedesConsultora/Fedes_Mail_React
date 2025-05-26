// src/pages/Settings.jsx
import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import FirmaForm from '../components/FirmaForm';

export default function Settings() {
  const [tab, setTab] = useState('firma');
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('');
  const [data, setData] = useState({
    firma_html: '',
    nombre_completo: '',
    puesto: '',
    equipo_trabajo: '',
    telefono_personal: ''
  });

  useEffect(() => {
    fetch('/FedesMail/api/usuario_actual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })
      .then(res => res.json())
      .then(user => {
        setData({
          firma_html: user.firma_html || '',
          nombre_completo: user.nombre_completo || '',
          puesto: user.puesto || '',
          equipo_trabajo: user.equipo_trabajo || '',
          telefono_personal: user.telefono_personal || ''
        });
        setLoading(false);
      })
      .catch(() => {
        setMensaje('⚠️ Error al cargar la configuración');
        setLoading(false);
      });
  }, []);

  const guardarCambios = () => {
    setMensaje('');
    fetch('/FedesMail/api/actualizar_firma', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
      .then(res => res.json())
      .then(res => {
        if (res.status === 'ok') setMensaje('✅ Cambios guardados correctamente.');
        else setMensaje('❌ Hubo un error al guardar.');
      })
      .catch(() => setMensaje('❌ Error de conexión al guardar.'));
  };

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading) return <Loader message="Cargando ajustes…" />;

  return (
    <div className="settings-container">
      <h2>⚙️ Configuraciones</h2>

      <div className="settings-tabs">
        <button className={tab === 'firma' ? 'active' : ''} onClick={() => setTab('firma')}>
          ✍️ Firma
        </button>
        {/* Otros tabs en el futuro */}
      </div>

      <div className="settings-content">
        {tab === 'firma' && (
          <FirmaForm
            data={data}
            onChange={handleChange}
            onSave={guardarCambios}
            mensaje={mensaje}
          />
        )}
      </div>
    </div>
  );
}