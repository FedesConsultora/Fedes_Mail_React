import React from 'react';
import { FaInbox, FaPaperPlane, FaStar, FaCog } from 'react-icons/fa';

const Sidebar = ({ isCollapsed }) => {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logoEiconos">
        <img src="https://fedesagency.com/fedes-consultora/landing/logoBlanco.png" alt="Fedes" />
        <nav>
            <ul>
            <li>
                <FaInbox />
                {!isCollapsed && <span>Recibidos</span>}
            </li>
            <li>
                <FaPaperPlane />
                {!isCollapsed && <span>Enviados</span>}
            </li>
            <li>
                <FaStar />
                {!isCollapsed && <span>Destacados</span>}
            </li>
            </ul>
        </nav>
      </div>
      
      <div className="config">
        <FaCog />
        {!isCollapsed && <span>Configuraciones</span>}
      </div>
    </aside>
  );
};

export default Sidebar;
