import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext'; // Asegurate de que la ruta sea correcta

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    api.obtenerUsuarioActual()
      .then(usuario => {
        if (usuario && typeof usuario.nombre === 'string' && typeof usuario.email === 'string') {
          setUser(usuario);
          console.log('📦 Usuario recibido y procesado:', usuario);
          showToast({ message: `👤 Bienvenido ${usuario.nombre.split(' ')[0]}!`, type: 'success' });
        } else {
          console.warn('⚠️ Usuario inválido o sin datos esperados:', usuario);
          setUser(null);
          showToast({ message: '⚠️ No se pudo obtener tu perfil correctamente.', type: 'warning' });
        }
      })
      .catch(err => {
        console.error('❌ Error al obtener usuario:', err);
        setUser(null);
        showToast({ message: '❌ Error al obtener datos del usuario.', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
