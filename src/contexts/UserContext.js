import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export default function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  console.log('usuario: ', user);
  useEffect(() => {
    api.obtenerUsuarioActual()
      .then(usuario => {
        console.log('📦 Usuario recibido y procesado:', usuario);
        setUser(usuario); // acá usuario ya es el objeto limpio
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
}
