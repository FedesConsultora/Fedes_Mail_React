import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import FirmaForm from '../components/FirmaForm';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api';

export default function Settings() {
  const { user, loading } = useUser();
  const { showToast } = useToast();
  const [tab, setTab] = useState('firma');
  const [data, setData] = useState(null);

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

  const guardarCambios = async () => {
    try {
      await api.actualizarDatosUsuario({
        nombre_completo: data.nombre_completo,
        puesto: data.puesto,
        equipo_trabajo: data.equipo_trabajo,
        telefono_personal: data.telefono_personal
      });

      const nuevoUsuario = await api.obtenerUsuarioActual();

      setData(prev => ({
        ...prev,
        firma_html: nuevoUsuario.firma_html ?? prev.firma_html,
        nombre_completo: nuevoUsuario.nombre_completo ?? prev.nombre_completo,
        puesto: nuevoUsuario.puesto ?? prev.puesto,
        equipo_trabajo: nuevoUsuario.equipo_trabajo ?? prev.equipo_trabajo,
        telefono_personal: nuevoUsuario.telefono_personal ?? prev.telefono_personal,
      }));

      showToast({ message: '✅ Cambios guardados correctamente.', type: 'success' });
    } catch (err) {
      showToast({ message: '❌ Error al guardar cambios.', type: 'error' });
    }
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
          />
        )}
      </div>
    </div>
  );
}
