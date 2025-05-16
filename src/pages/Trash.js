import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function Trash() {
  const { user, loading } = useUser();
  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMails, setTotalMails] = useState(0);
  const mailsPerPage = 50;

  useEffect(() => {
    if (!loading) {
      api
        .obtenerEliminados(currentPage, mailsPerPage)
        .then((res) => {
          const emails = Array.isArray(res?.emails) ? res.emails : [];
          const total = typeof res?.total === 'number' ? res.total : emails.length;

          setMails(emails);
          setTotalMails(total);
          setSelectedIds([]);
        })
        .catch(console.error);
    }
  }, [loading, currentPage]);

  async function marcarComoLeidoIndividual(id, is_read = true) {
    try {
      await api.setState({
        folder: 'trash',
        mail_ids: [id],
        state: { is_read }
      });

      setMails((curr) =>
        curr.map((m) =>
          m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m
        )
      );
    } catch (err) {
      console.error('❌ Error al cambiar lectura:', err);
    }
  }

  function eliminarCorreoLocal(id) {
    setMails((curr) => curr.filter((m) => m.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalMails((prev) => Math.max(prev - 1, 0));
  }

    async function restaurarSeleccionados() {
        if (!selectedIds.length) return;

        try {
            const res = await api.restoreMails(selectedIds); // ← API
            console.log('♻️ Restaurados:', res.restored);
            setMails((curr) => curr.filter((m) => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            setTotalMails((prev) => Math.max(0, prev - res.restored));
        } catch (err) {
            console.error('❌ Error al restaurar:', err);
            alert('Error al restaurar los correos.');
        }
    }

  const toggleSelectAll = () => {
    if (selectedIds.length === mails.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(mails.map((m) => m.id).filter(Boolean));
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

  const todosLeidos = selectedIds.length > 0 &&
    selectedIds.every(id => {
      const mail = mails.find(m => m.id === id);
      return mail?.is_read;
    });

  async function toggleLecturaSeleccionados() {
    if (!selectedIds.length) return;

    const hayNoLeidos = mails.some(m => selectedIds.includes(m.id) && !m.is_read);
    const nuevoEstado = hayNoLeidos;

    try {
      await api.setState({
        folder: 'trash',
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

  const totalPages = Math.ceil(totalMails / mailsPerPage);

  if (loading) return <div>Cargando papelera…</div>;

  return (
    <MailboxLayout
      allSelected={isAllSelected}
      someSelected={isSomeSelected}
      onSelectAll={toggleSelectAll}
      selected={isAnySelected}
      isRead={todosLeidos}
      currentPage={currentPage}
      totalMails={totalMails}
      onRestoreSelected={restaurarSeleccionados}
      onToggleRead={toggleLecturaSeleccionados}
      onPrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      onNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    >
      {mails.length > 0 ? (
        mails.map((mail) =>
          mail?.id ? (
            <MailCard
              key={mail.id}
              mail={mail}
              selected={selectedIds.includes(mail.id)}
              onToggle={() => toggleSelectOne(mail.id)}
              isSent={false}
              onToggleFavorite={() => {}} // no aplica favoritos en trash
              onMarkRead={marcarComoLeidoIndividual}
              onDeleteMail={eliminarCorreoLocal}
            />
          ) : null
        )
      ) : (
        <div className="no-mails">No hay correos en la papelera.</div>
      )}
    </MailboxLayout>
  );
}
