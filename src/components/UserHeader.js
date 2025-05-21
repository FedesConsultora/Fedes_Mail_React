import React from 'react';
import { useUser } from '../contexts/UserContext';

function UserHeader() {
  const { user } = useUser();

  if (!user || typeof user.nombre !== 'string' || typeof user.imagen_avatar !== 'string') {
    return null;
  }

  const partes = user.nombre.trim().split(' ');
  const nombre = partes[0] || 'Usuario';
  const segundoNombre = partes[1] || '';
  const apellido = partes.slice(2).join(' ') || '';
  const inicial = segundoNombre ? ` ${segundoNombre[0]}.` : '';

  return (
    <div className="user-header">
      <article className="contenedorUsuario">
        <img
          src={`data:image/jpeg;base64,${user.imagen_avatar}`}
          alt={user.nombre}
          className="user-avatar"
        />
        <span className="user-name">{`${nombre}${inicial} ${apellido}`}</span>
      </article>
    </div>
  );
}

export default React.memo(UserHeader);
