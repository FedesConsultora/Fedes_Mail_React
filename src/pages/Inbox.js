import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

export default function Inbox() {
  const { user, loading } = useUser();
  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const mailsPerPage = 50;
  const [totalMails, setTotalMails] = useState(0);
  const { showToast } = useToast();

  /* ————— MARCAR COMO FAVORITO ————— */
  async function toggleFavorite(id, nuevoEstado) {
    try {
      await api.setState({
        folder: 'inbox',
        mail_ids: [id],
        state: { favorite: nuevoEstado }
      });

      setMails(curr =>
        curr.map(m =>
          m.id === id ? { ...m, favorite: nuevoEstado } : m
        )
      );
    } catch (err) {
      showToast({ message: '❌ Error al actualizar favoritos.', type: 'error' });
      
      
    }
  }
  
   /* ————— MARCAR LEÍDO / NO LEÍDO ————— */
  async function toggleLecturaSeleccionados() {
    if (!selectedIds.length) return;

    const hayNoLeidos = mails.some(m => selectedIds.includes(m.id) && !m.is_read);
    const nuevoEstado = hayNoLeidos; // Si hay alguno no leído, los marcamos como leídos

    try {
      await api.setState({
        folder: 'inbox',
        mail_ids: selectedIds,
        state: { is_read: nuevoEstado }
      });

      setMails(curr =>
        curr.map(m =>
          selectedIds.includes(m.id)
            ? { ...m, is_read: nuevoEstado, state: nuevoEstado ? 'read' : 'unread' }
            : m
        )
      );

      setSelectedIds([]);
      showToast({ message: `✅ ${selectedIds.length} correo(s) marcados como ${nuevoEstado ? 'leídos' : 'no leídos'}`, type: 'success' });
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      showToast({ message: '❌ Error al marcar como leido.', type: 'error' });
      
    }
  }

  //MARCAR DETALLE COMO LEÍDO
  async function marcarComoLeidoIndividual(id, is_read = true) {
    try {
      await api.setState({
        folder: 'inbox',
        mail_ids: [id],
        state: { is_read }
      });

      setMails((curr) =>
        curr.map((m) =>
          m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m
        )
      );
    } catch (err) {
      showToast({ message: '❌ Error al cambiar lectura.', type: 'error' });
    }
  }


  useEffect(() => {
    if (user?.email) {
      api
        .obtenerInbox(user.email, currentPage, mailsPerPage)
        .then((res) => {
          const emails = Array.isArray(res?.emails) ? res.emails : [];
          const total = typeof res?.total === 'number' ? res.total : emails.length;

          setMails(emails);
          setTotalMails(total);
          setSelectedIds([]); // Limpiar selección al cambiar página
        })
        .catch(console.error);
    }
  }, [user, currentPage]);

  const totalPages = Math.ceil(totalMails / mailsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === mails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mails.map((mail) => mail?.id).filter(Boolean));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  function eliminarCorreoLocal(id) {
    setMails((curr) => curr.filter((m) => m.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalMails((prev) => Math.max(prev - 1, 0));
    showToast({ message: '🗑️ Correo eliminado', type: 'warning' });
  }

  const isAllSelected = selectedIds.length === mails.length && mails.length > 0;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;
  const isAnySelected = selectedIds.length > 0;

  const todosLeidos = selectedIds.length > 0 &&
  selectedIds.every(id => {
    const mail = mails.find(m => m.id === id);
    return mail?.is_read;
  });

  if (loading || !user) {
    return <div>Cargando usuario y correos...</div>;
  }

  return (
    <MailboxLayout
      allSelected={isAllSelected}
      someSelected={isSomeSelected}
      onSelectAll={toggleSelectAll}
      selected={isAnySelected}
      isRead={todosLeidos}
      currentPage={currentPage}
      totalMails={totalMails}
      onToggleRead={toggleLecturaSeleccionados}
      onPrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      onNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      
    >
      {Array.isArray(mails) && mails.length > 0 ? (
        mails.map((mail) =>
          mail?.id ? (
            <MailCard
              key={mail.id}
              mail={mail}
              selected={selectedIds.includes(mail.id)}
              onToggle={() => toggleSelectOne(mail.id)}
              isSent={false}
              onToggleFavorite={toggleFavorite}
              onMarkRead={marcarComoLeidoIndividual}
              onDeleteMail={eliminarCorreoLocal}
            />
          ) : null
        )
      ) : (
        <div className="no-mails">No se encontraron correos.</div>
      )}
    </MailboxLayout>
  );
}