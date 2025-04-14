import React, { useState } from 'react';
import { FaInbox, FaPaperPlane, FaStar, FaCog } from 'react-icons/fa';
import ComposeButton from '../ComposeButton';
import ComposeModal from '../ComposeModal';

const Sidebar = ({ isCollapsed }) => {
  const [showCompose, setShowCompose] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="logoEiconos">
        <img src="https://fedesagency.com/fedes-consultora/landing/logoBlanco.png" alt="Fedes" />
        <ComposeButton onClick={() => setShowCompose(true)} />
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
      {showCompose && (
        <ComposeModal onClose={() => setShowCompose(false)} />
      )}
    </aside>
  );
};

export default Sidebar;
