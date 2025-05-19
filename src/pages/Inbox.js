import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';

export default function Inbox() {
  const { user, loading: loadingUser } = useUser();
  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const mailsPerPage = 50;
  const [totalMails, setTotalMails] = useState(0);
  const [loadingMails, setLoadingMails] = useState(true);
  const { showToast } = useToast();

  // MARCAR COMO FAVORITO
  async function toggleFavorite(id, nuevoEstado) {
    try {
      await api.setState({
        folder: 'inbox',
        mail_ids: [id],
        state: { favorite: nuevoEstado }
      });
      setMails(curr =>
        curr.map(m => (m.id === id ? { ...m, favorite: nuevoEstado } : m))
      );
    } catch (err) {
      showToast({ message: '❌ Error al actualizar favoritos.', type: 'error' });
    }
  }

  // MARCAR LEÍDO / NO LEÍDO
  async function toggleLecturaSeleccionados() {
    if (!selectedIds.length) return;

    const hayNoLeidos = mails.some(m => selectedIds.includes(m.id) && !m.is_read);
    const nuevoEstado = hayNoLeidos;

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
      showToast({
        message: `✅ ${selectedIds.length} correo(s) marcados como ${nuevoEstado ? 'leídos' : 'no leídos'}`,
        type: 'success'
      });
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err);
      showToast({ message: '❌ Error al marcar como leído.', type: 'error' });
    }
  }

  // MARCAR UN CORREO COMO LEÍDO
  async function marcarComoLeidoIndividual(id, is_read = true) {
    try {
      await api.setState({
        folder: 'inbox',
        mail_ids: [id],
        state: { is_read }
      });

      setMails(curr =>
        curr.map(m =>
          m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m
        )
      );
    } catch (err) {
      showToast({ message: '❌ Error al cambiar lectura.', type: 'error' });
    }
  }
  function recargarInbox() {
    if (!user || typeof user.email !== 'string') return;

    setLoadingMails(true);
    api
      .obtenerInbox(user.email, currentPage, mailsPerPage)
      .then((res) => {
        const emails = Array.isArray(res?.emails) ? res.emails : [];
        const total = typeof res?.total === 'number' ? res.total : emails.length;

        setMails(emails);
        setTotalMails(total);
        setSelectedIds([]);
      })
      .catch((err) => {
        console.error('❌ Error al recargar inbox:', err);
        showToast({ message: '❌ Error al recargar correos', type: 'error' });
      })
      .finally(() => setLoadingMails(false));
  }
  // CARGAR CORREOS
  useEffect(() => {
    if (!user || typeof user.email !== 'string') return;

    console.log(`📥 Cargando correos para ${user.email}...`);
    setLoadingMails(true);

    api
      .obtenerInbox(user.email, currentPage, mailsPerPage)
      .then((res) => {
        const emails = Array.isArray(res?.emails) ? res.emails : [];
        const total = typeof res?.total === 'number' ? res.total : emails.length;

        console.log(`📬 Correos recibidos: ${emails.length}, Total: ${total}`);
        setMails(emails);
        setTotalMails(total);
        setSelectedIds([]);
      })
      .catch((err) => {
        console.error('❌ Error al obtener inbox:', err);
        showToast({ message: '❌ Error al cargar correos', type: 'error' });
      })
      .finally(() => setLoadingMails(false));
  }, [user, currentPage, showToast]); 

  // CONTROL DE SELECCIÓN
  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === mails.length ? [] : mails.map((mail) => mail?.id).filter(Boolean)
    );
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  function eliminarCorreoLocal(id) {
    setMails(curr => curr.filter(m => m.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    setTotalMails(prev => Math.max(prev - 1, 0));
    showToast({ message: '🗑️ Correo eliminado', type: 'warning' });
  }
  // NUEVO: eliminar múltiples
  async function eliminarSeleccionados() {
    if (!selectedIds.length) return;

    try {
      const res = await api.deleteMails({ folder: 'inbox', mail_ids: selectedIds });

      if (res?.deleted > 0) {
        setMails(curr => curr.filter(m => !selectedIds.includes(m.id)));
        setSelectedIds([]);
        setTotalMails(prev => Math.max(prev - res.deleted, 0));
        showToast({ message: `🗑️ ${res.deleted} correo(s) eliminados`, type: 'warning' });
      } else {
        showToast({ message: '⚠️ No se eliminaron correos', type: 'info' });
      }

    } catch (err) {
      console.error('❌ Error al eliminar múltiples:', err);
      showToast({ message: '❌ Error al eliminar correos seleccionados', type: 'error' });
    }
  }
  const isAllSelected = selectedIds.length === mails.length && mails.length > 0;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;
  //const isAnySelected = selectedIds.length > 0;

  const todosLeidos = selectedIds.length > 0 &&
    selectedIds.every(id => mails.find(m => m.id === id)?.is_read);

  const totalPages = Math.ceil(totalMails / mailsPerPage);

  if (loadingUser || !user) {
    return (
      <div className="inbox-loading">
        <div className="spinner"></div>
        <p>Cargando usuario y correos...</p>
      </div>
    );
  }

  return (
    <MailboxLayout
      allSelected={isAllSelected}
      someSelected={isSomeSelected}
      onSelectAll={toggleSelectAll}
      selected={selectedIds}
      isRead={todosLeidos}
      currentPage={currentPage}
      totalMails={totalMails}
      onReload={recargarInbox}
      onDeleteMultiple={eliminarSeleccionados}
      onToggleRead={toggleLecturaSeleccionados}
      onPrevPage={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
      onNextPage={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
    >
      {loadingMails ? (
        <div className="inbox-loading">
          <div className="spinner"></div>
          <p>Cargando correos...</p>
        </div>
      ) : Array.isArray(mails) && mails.length > 0 ? (
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
