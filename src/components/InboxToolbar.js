import React, { useEffect, useRef, useState } from 'react';
import {
  FaRedo,
  FaEllipsisV,
  FaEnvelopeOpenText,
  FaTrash,
  FaArchive,
  FaEnvelope,
  FaChevronLeft,
  FaChevronRight,
  FaUndoAlt
} from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import { useToast } from '../contexts/ToastContext';

export default function InboxToolbar({
  allSelected,
  someSelected,
  onSelectAll,
  selected = [],
  isRead,
  onToggleRead,
  currentPage,
  totalMails,
  onPrevPage,
  onNextPage,
  onDeleteMultiple,
  onRestoreSelected // 👈 debe venir como prop desde Trash.jsx
}) {
  const [showMenu, setShowMenu] = useState(false);
  const checkboxRef = useRef(null);
  const location = useLocation();
  const { showToast } = useToast();
  // Carpeta actual detectada por pathname
  const getFolderFromPath = (pathname) => {
    if (pathname.includes('/sent')) return 'sent';
    if (pathname.includes('/starred')) return 'starred';
    if (pathname.includes('/spam')) return 'spam';
    if (pathname.includes('/trash')) return 'trash';
    return 'inbox';
  };

  const currentFolder = getFolderFromPath(location.pathname);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  const start = (currentPage - 1) * 50 + 1;
  const end = Math.min(currentPage * 50, totalMails);
  const hasSelection = Array.isArray(selected) && selected.length > 0;

  return (
    <div className="inboxToolbar">
      <div className="actions">
        <input
          type="checkbox"
          ref={checkboxRef}
          checked={allSelected}
          onChange={onSelectAll}
        />

        {hasSelection ? (
          <>
            {currentFolder === 'trash' && onRestoreSelected && (
              <button
                className="toolbarIcon"
                onClick={() => onRestoreSelected(selected)}
              >
                <FaUndoAlt title="Restaurar seleccionados" />
              </button>
            )}

            <button
              className="toolbarIcon"
              onClick={async () => {
                try {
                  onDeleteMultiple?.();
                } catch (err) {
                  console.error('❌ Error al eliminar:', err);
                  showToast({ message: '❌ Error al eliminar correos.', type: 'error' });
                }
              }}
            >
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
            <FaRedo
              className="toolbarIcon"
              title="Actualizar"
              onClick={() => window.location.reload()}
            />
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
        <span className="paginationRange">
          {start}–{end} de {totalMails}
        </span>
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
