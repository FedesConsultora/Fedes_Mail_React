import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

export default function Spam() {
  const { user, loading: loadingUser } = useUser();
  const [mails,        setMails]        = useState([]);
  const [selectedIds,  setSelectedIds]  = useState([]);
  const [currentPage,  setCurrentPage]  = useState(1);
  const [totalMails,   setTotalMails]   = useState(0);
  const [loadingMails, setLoadingMails] = useState(true);
  const mailsPerPage = 50;
  const { showToast } = useToast();

  /* ────────────────────────────────────────────────
     Recarga explícita (botón “Actualizar” del toolbar)
  ──────────────────────────────────────────────── */
  async function recargarSpam() {
    if (!user) return;
    setLoadingMails(true);
    try {
      const { emails = [], total = 0 } = await api.obtenerSpam(currentPage, mailsPerPage);
      setMails(emails);
      setTotalMails(total);
      setSelectedIds([]);
    } catch (err) {
      console.error('❌ Error al recargar spam:', err);
      showToast({ message: '❌ Error al recargar correos', type: 'error' });
    } finally {
      setLoadingMails(false);
    }
  }

  /* ────────────────────────────────────────────────
     Carga inicial + paginación
  ──────────────────────────────────────────────── */
  useEffect(() => {
    if (!user || typeof user.email !== 'string') return;
    recargarSpam();                     
  }, [user, currentPage]);               

  /* ────────────────────────────────────────────────
     Helpers de selección / estado / borrado
  ──────────────────────────────────────────────── */
  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === mails.length ? [] : mails.map(m => m?.id).filter(Boolean)
    );
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  async function eliminarSeleccionados() {
    if (!selectedIds.length) return;
    try {
      const { deleted = 0 } = await api.deleteMails({ folder: 'spam', mail_ids: selectedIds });
      if (deleted) {
        setMails(curr => curr.filter(m => !selectedIds.includes(m.id)));
        setSelectedIds([]);
        setTotalMails(prev => Math.max(prev - deleted, 0));
        showToast({ message: `🗑️ ${deleted} correo(s) eliminados`, type: 'warning' });
      }
    } catch (err) {
      showToast({ message: '❌ Error al eliminar correos.', type: 'error' });
    }
  }

  const todosLeidos = selectedIds.length > 0 &&
    selectedIds.every(id => mails.find(m => m.id === id)?.is_read);

  async function toggleLecturaSeleccionados() {
    if (!selectedIds.length) return;
    const hayNoLeidos = mails.some(m => selectedIds.includes(m.id) && !m.is_read);
    const nuevoEstado = hayNoLeidos;
    try {
      await api.setState({ folder: 'spam', mail_ids: selectedIds, state: { is_read: nuevoEstado } });
      setMails(curr =>
        curr.map(m =>
          selectedIds.includes(m.id)
            ? { ...m, is_read: nuevoEstado, state: nuevoEstado ? 'read' : 'unread' }
            : m
        )
      );
      setSelectedIds([]);
    } catch (err) {
      showToast({ message: '❌ Error al cambiar lectura.', type: 'error' });
    }
  }

  async function marcarComoLeidoIndividual(id, is_read = true) {
    try {
      await api.setState({ folder: 'spam', mail_ids: [id], state: { is_read } });
      setMails(curr =>
        curr.map(m => m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m)
      );
    } catch (err) {
      showToast({ message: '❌ Error al cambiar lectura.', type: 'error' });
    }
  }

  function eliminarCorreoLocal(id) {
    setMails(curr => curr.filter(m => m.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    setTotalMails(prev => Math.max(prev - 1, 0));
    showToast({ message: '🗑️ Correo eliminado', type: 'warning' });
  }

  /* ────────────────────────────────────────────────
     Render
  ──────────────────────────────────────────────── */
  const isAllSelected = selectedIds.length === mails.length && mails.length > 0;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;
  const totalPages = Math.ceil(totalMails / mailsPerPage);

  if (!user || loadingUser) return null;  

  return (
    <MailboxLayout
      allSelected={isAllSelected}
      someSelected={isSomeSelected}
      onSelectAll={toggleSelectAll}
      selected={selectedIds}
      isRead={todosLeidos}
      currentPage={currentPage}
      totalMails={totalMails}
      onReload={recargarSpam}                       
      onDeleteMultiple={eliminarSeleccionados}
      onToggleRead={toggleLecturaSeleccionados}
      onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
      onNextPage={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
    >
      {loadingMails ? (
        <div className="inbox-loading">
          <div className="spinner" />
          <p>Cargando correos spam…</p>
        </div>
      ) : mails.length ? (
        mails.map(mail => (
          mail?.id && (
            <MailCard
              key={mail.id}
              mail={mail}
              selected={selectedIds.includes(mail.id)}
              onToggle={() => toggleSelectOne(mail.id)}
              onToggleFavorite={() => {}}
              onMarkRead={marcarComoLeidoIndividual}
              onDeleteMail={eliminarCorreoLocal}
            />
          )
        ))
      ) : (
        <div className="no-mails">No hay correos en spam.</div>
      )}
    </MailboxLayout>
  );
}
