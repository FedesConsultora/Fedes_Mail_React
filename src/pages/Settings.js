import { useEffect, useState } from 'react';
import Loader from '../components/Loader';
import FirmaForm from '../components/FirmaForm';
import { useUser } from '../contexts/UserContext';

export default function Settings() {
  const { user, loading } = useUser();
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

  if (loading || !data) return <Loader message="Cargando ajustes…" />;

  return (
    <div className="settings-container">
      <h2>⚙️ Configuraciones</h2>

      <div className="settings-tabs">
        <button className="active">
          ✍️ Firma
        </button>
      </div>

      <div className="settings-content">
        <FirmaForm
          data={data}
          readonly={true}
        />
      </div>
    </div>
  );
}
