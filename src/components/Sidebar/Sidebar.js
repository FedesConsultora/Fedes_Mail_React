import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaInbox,
  FaPaperPlane,
  FaStar,
  FaTrash,
  FaCog,
  FaExclamationCircle // 👈 ícono para SPAM
} from 'react-icons/fa';
import ComposeButton from '../ComposeButton';
import ComposeModal from '../ComposeModal';

export default function Sidebar({ isCollapsed }) {
  const [showCompose, setShowCompose] = useState(false);

  const logoURL = isCollapsed
    ? 'https://fedesagency.com/fedes-consultora/landing/IsologoBlanco.png'
    : 'https://fedesagency.com/fedes-consultora/landing/logoBlanco.png';

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logoEiconos">
        <img src={logoURL} alt="Fedes" />

        <ComposeButton onClick={() => setShowCompose(true)} />

        <nav>
          <ul>
            <li>
              <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaInbox /> {!isCollapsed && <span>Recibidos</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/sent" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaPaperPlane /> {!isCollapsed && <span>Enviados</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/starred" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaStar /> {!isCollapsed && <span>Destacados</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/spam" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaExclamationCircle /> {!isCollapsed && <span>Spam</span>}
              </NavLink>
            </li>
            <li>
              <NavLink to="/trash" className={({ isActive }) => isActive ? 'active' : ''}>
                <FaTrash /> {!isCollapsed && <span>Papelera</span>}
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>

      <div className="config">
        <FaCog /> {!isCollapsed && <span>Configuraciones</span>}
      </div>

      {showCompose && <ComposeModal onClose={() => setShowCompose(false)} />}
    </aside>
  );
}
