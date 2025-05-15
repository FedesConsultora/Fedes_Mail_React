import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function Inbox() {
  const { user, loading } = useUser();
  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const mailsPerPage = 50;
  const [totalMails, setTotalMails] = useState(0);
  

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
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      alert('No se pudo cambiar el estado de lectura.');
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


  const isAllSelected = selectedIds.length === mails.length && mails.length > 0;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;
  const isAnySelected = selectedIds.length > 0;

  if (loading || !user) {
    return <div>Cargando usuario y correos...</div>;
  }

  return (
    <MailboxLayout
      allSelected={isAllSelected}
      someSelected={isSomeSelected}
      onSelectAll={toggleSelectAll}
      selected={isAnySelected}
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
            />
          ) : null
        )
      ) : (
        <div className="no-mails">No se encontraron correos.</div>
      )}
    </MailboxLayout>
  );
}