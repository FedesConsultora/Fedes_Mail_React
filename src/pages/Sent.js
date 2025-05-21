/*  src/pages/Sent.jsx  */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from 'react-router-dom';

export default function Sent() {
  const { user } = useUser();
  const { showToast } = useToast();
  const location = useLocation();

  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMails, setTotalMails] = useState(0);
  const mailsPerPage = 50;

  const currentFolder = useMemo(() => {
    if (location.pathname.includes('/trash')) return 'trash';
    if (location.pathname.includes('/sent')) return 'sent';
    return 'inbox';
  }, [location.pathname]);

  const totalPages = useMemo(() => Math.ceil(totalMails / mailsPerPage), [totalMails]);

  const toggleFavorite = useCallback(async (id, nuevoEstado) => {
    try {
      await api.setState({ folder: currentFolder, mail_ids: [id], state: { favorite: nuevoEstado } });
      setMails(curr => curr.map(m => m.id === id ? { ...m, favorite: nuevoEstado } : m));
    } catch (err) {
      console.error('❌ Error al actualizar favorito:', err);
      showToast({ message: '❌ Error al actualizar favorito.', type: 'error' });
    }
  }, [currentFolder, showToast]);

  const marcarComoLeidoIndividual = useCallback(async (id, is_read = true) => {
    try {
      await api.setState({ folder: 'sent', mail_ids: [id], state: { is_read } });
      setMails(curr => curr.map(m => m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m));
    } catch (err) {
      console.error('❌ Error al cambiar lectura:', err);
    }
  }, []);

  const eliminarCorreoLocal = useCallback((id) => {
    setMails(curr => curr.filter(m => m.id !== id));
    setSelectedIds(prev => prev.filter(i => i !== id));
    setTotalMails(prev => Math.max(prev - 1, 0));
  }, []);

  const eliminarSeleccionados = useCallback(() => {
    if (!selectedIds.length) return;

    showToast({
      message: `¿Eliminar <strong>${selectedIds.length}</strong> correo(s) enviados?`,
      type: 'warning',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          const res = await api.deleteMails({ folder: 'sent', mail_ids: selectedIds });

          if (res?.deleted > 0) {
            setMails(curr => curr.filter(m => !selectedIds.includes(m.id)));
            setSelectedIds([]);
            setTotalMails(prev => Math.max(prev - res.deleted, 0));
            showToast({ message: `🗑️ ${res.deleted} correo(s) eliminados`, type: 'warning' });
          } else {
            showToast({ message: '⚠️ No se eliminaron correos', type: 'info' });
          }
        } catch (err) {
          showToast({ message: '❌ Error al eliminar correos seleccionados', type: 'error' });
        }
      }
    });
  }, [selectedIds, showToast]);

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === mails.length
        ? []
        : mails.map(m => m?.id).filter(Boolean)
    );
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    if (!user || typeof user.email !== 'string') return;

    api
      .obtenerEnviados(currentPage, mailsPerPage)
      .then(({ emails = [], total = 0 }) => {
        setMails(emails);
        setTotalMails(total);
        setSelectedIds([]);
      })
      .catch((err) => {
        console.error('❌ Error al cargar enviados:', err);
        showToast({ message: '❌ Error al cargar enviados:', type: 'error' });
      });
  }, [user, currentPage, showToast]);

  return (
    <MailboxLayout
      allSelected={selectedIds.length === mails.length && mails.length > 0}
      someSelected={selectedIds.length > 0 && selectedIds.length < mails.length}
      onSelectAll={toggleSelectAll}
      onMarkAllRead={() => {}} // Podés implementar si querés bulk read
      onDeleteMultiple={eliminarSeleccionados}
      selected={selectedIds}
      currentPage={currentPage}
      totalMails={totalMails}
      onPrevPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
    >
      {Array.isArray(mails) && mails.length > 0 ? (
        mails.map(mail =>
          mail?.id && (
            <MailCard
              key={mail.id}
              mail={mail}
              selected={selectedIds.includes(mail.id)}
              onToggle={() => toggleSelectOne(mail.id)}
              isSent={true}
              onToggleFavorite={toggleFavorite}
              onMarkRead={marcarComoLeidoIndividual}
              onDeleteMail={eliminarCorreoLocal}
            />
          )
        )
      ) : (
        <div className="no-mails">No hay correos enviados.</div>
      )}
    </MailboxLayout>
  );
}
