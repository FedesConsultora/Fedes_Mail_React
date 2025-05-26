import { useState } from 'react';
import Loader from '../components/Loader';
import FirmaForm from '../components/FirmaForm';
import { useUser } from '../contexts/UserContext';

export default function Settings() {
  const { user, loading } = useUser();
  const [tab, setTab] = useState('firma');
  const [mensaje, setMensaje] = useState('');
  const [data, setData] = useState(null);

  // Preparo data local una vez que carga el usuario
  useEffect(() => {
    if (user) {
      setData({
        firma_html: user.firma_html || '',
        nombre_completo: user.nombre_completo || '',
        puesto: user.puesto || '',
        equipo_trabajo: user.equipo_trabajo || '',
        telefono_personal: user.telefono_personal || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

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

  if (loading || !data) return <Loader message="Cargando ajustes…" />;

  return (
    <div className="settings-container">
      <h2>⚙️ Configuraciones</h2>

      <div className="settings-tabs">
        <button className={tab === 'firma' ? 'active' : ''} onClick={() => setTab('firma')}>
          ✍️ Firma
        </button>
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
