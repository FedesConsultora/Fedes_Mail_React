import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import FirmaForm from '../components/FirmaForm';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import api from '../services/api'; // asegurate de tener el método regenerarFirma en api.js

export default function Settings() {
  const { user, loading } = useUser();
  const { showToast } = useToast();
  const [tab, setTab] = useState('firma');
  const [data, setData] = useState(null);
  const [cargandoFirma, setCargandoFirma] = useState(false);

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

      await api.actualizarFirma({ firma_html: data.firma_html });
      const nuevoUsuario = await api.obtenerUsuarioActual();
      setData({
        firma_html: nuevoUsuario.firma_html || '',
        nombre_completo: nuevoUsuario.nombre_completo || '',
        puesto: nuevoUsuario.puesto || '',
        equipo_trabajo: nuevoUsuario.equipo_trabajo || '',
        telefono_personal: nuevoUsuario.telefono_personal || ''
      });
      showToast({ message: '✅ Cambios guardados correctamente.', type: 'success' });
    } catch (err) {
      showToast({ message: '❌ Error al guardar cambios.', type: 'error' });
    }
  };

  const regenerarFirma = async () => {
    setCargandoFirma(true);
    try {
      const res = await api.regenerarFirma();
      setData(prev => ({ ...prev, firma_html: res.firma_html || '' }));
      showToast({ message: '✅ Firma HTML actualizada.', type: 'success' });
    } catch (err) {
      showToast({ message: '❌ Error al regenerar firma.', type: 'error' });
    } finally {
      setCargandoFirma(false);
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
            regenerarFirma={regenerarFirma}
            cargandoFirma={cargandoFirma}
          />
        )}
      </div>
    </div>
  );
}
