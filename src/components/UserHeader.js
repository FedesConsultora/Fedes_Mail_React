// src/components/UserHeader.jsx
import React from 'react';
import { useUser } from '../contexts/UserContext';

export default function UserHeader() {
    const { user } = useUser();
    
    if (!user) return null;

    const [nombre, segundoNombre, ...resto] = user.nombre.split(' ');
    const apellido = resto.join(' ');
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
