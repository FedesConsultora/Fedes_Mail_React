import React, { useState } from 'react';
import { FaRedo, FaEllipsisV, FaEnvelopeOpenText } from 'react-icons/fa';

export default function InboxToolbar({ allSelected, onSelectAll, onMarkAllRead }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="inboxToolbar">
      <input
        type="checkbox"
        checked={allSelected}
        onChange={(e) => onSelectAll(e.target.checked)}
      />
      <FaRedo className="toolbarIcon" title="Actualizar" onClick={() => window.location.reload()} />
      <div className="toolbarMenu">
        <FaEllipsisV
          className="toolbarIcon"
          title="Más acciones"
          onClick={() => setShowMenu(!showMenu)}
        />
        {showMenu && (
          <div className="dropdownMenu">
            <div className="dropdownItem" onClick={onMarkAllRead}>
              <FaEnvelopeOpenText /> <span>Marcar como leído</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
