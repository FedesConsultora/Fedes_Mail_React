import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useToast } from './ToastContext';

const UserContext = createContext();
export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]); 

  useEffect(() => {
    api.obtenerUsuarioActual()
      .then(usuario => {
        if (usuario && typeof usuario.nombre === 'string' && typeof usuario.email === 'string') {
          setUser(usuario);
          console.log('📦 Usuario recibido y procesado:', usuario);
          showToastRef.current({ message: `👤 Bienvenido ${usuario.nombre.split(' ')[0]}!`, type: 'success' });
        } else {
          console.warn('⚠️ Usuario inválido o sin datos esperados:', usuario);
          setUser(null);
          showToastRef.current({ message: '⚠️ No se pudo obtener tu perfil correctamente.', type: 'warning' });
        }
      })
      .catch(err => {
        console.error('❌ Error al obtener usuario:', err);
        setUser(null);
        showToastRef.current({ message: '❌ Error al obtener datos del usuario.', type: 'error' });
      })
      .finally(() => setLoading(false));
  }, []); // ← solo una vez, al montar

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
