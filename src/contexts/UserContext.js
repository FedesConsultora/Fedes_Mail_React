import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.obtenerUsuarioActual()
      .then(res => {
        if (res?.success && typeof res.nombre === 'string' && typeof res.email === 'string') {
          const { success, ...usuario } = res;
          setUser(usuario);
          console.log('📦 Usuario recibido y procesado:', usuario);
        } else {
          console.warn('⚠️ Usuario inválido o sin success:', res);
          setUser(null);
        }
      })
      .catch(err => {
        console.error('❌ Error al obtener usuario:', err);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
