import React, { useEffect, useRef, useState } from 'react';
import {
  FaRedo,
  FaEllipsisV,
  FaEnvelopeOpenText,
  FaTrash,
  FaArchive,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';

export default function InboxToolbar({
  allSelected,
  someSelected,
  onSelectAll,
  selected,
  isRead,
  onToggleRead,
  currentPage,
  totalMails,
  onPrevPage,
  onNextPage
}) {
  const [showMenu, setShowMenu] = useState(false);
  const checkboxRef = useRef(null);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const start = (currentPage - 1) * 50 + 1;
  const end = Math.min(currentPage * 50, totalMails);

  return (
    <div className="inboxToolbar">
      <div className="actions">
        <input
          type="checkbox"
          ref={checkboxRef}
          checked={allSelected}
          onChange={onSelectAll}
        />

        {selected ? (
          <>
            <button className="toolbarIcon" onClick={() => alert('Eliminar')}>
              <FaTrash title="Eliminar" />
            </button>
            <button className="toolbarIcon" onClick={() => alert('Archivar')}>
              <FaArchive title="Archivar" />
            </button>
            <button
              className="toolbarIcon"
              onClick={onToggleRead}
              title={isRead ? 'Marcar como no leído' : 'Marcar como leído'}
            >
              <span className="icon-unread">
                <FaEnvelope />
                {isRead && <span className="unread-dot" />}
              </span>
            </button>
          </>
        ) : (
          <>
            <FaRedo className="toolbarIcon" title="Actualizar" onClick={() => window.location.reload()} />
            <div className="toolbarMenu">
              <FaEllipsisV
                className="toolbarIcon"
                title="Más acciones"
                onClick={() => setShowMenu(!showMenu)}
              />
              {showMenu && (
                <div className="dropdownMenu">
                  <div className="dropdownItem" onClick={onToggleRead}>
                    <FaEnvelopeOpenText /> <span>Marcar como leído</span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      

      <div className="paginationControls">
        <span className="paginationRange">{start}–{end} de {totalMails}</span>
        <button
          className="paginationArrow left"
          onClick={onPrevPage}
          disabled={currentPage === 1}
          title="Anterior"
        >
          <FaChevronLeft />
        </button>
        <button
          className="paginationArrow"
          onClick={onNextPage}
          disabled={end >= totalMails}
          title="Siguiente"
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
}