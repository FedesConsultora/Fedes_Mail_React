import React, { useState, useEffect, useCallback, useMemo } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function Starred() {
  const { user } = useUser();

  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMails, setTotalMails] = useState(0);
  const mailsPerPage = 50;

  const totalPages = useMemo(() => Math.ceil(totalMails / mailsPerPage), [totalMails]);

  const toggleFavorite = useCallback(async (id, nuevoEstado) => {
    try {
      await api.setState({ folder: 'inbox', mail_ids: [id], state: { favorite: nuevoEstado } });
      setMails(curr => curr.map(m => m.id === id ? { ...m, favorite: nuevoEstado } : m));
    } catch (err) {
      console.error('❌ Error al actualizar favorito:', err);
    }
  }, []);

  const marcarComoLeidoIndividual = useCallback(async (id, is_read = true) => {
    try {
      await api.setState({ folder: 'inbox', mail_ids: [id], state: { is_read } });
      setMails(curr => curr.map(m => m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m));
    } catch (err) {
      console.error('❌ Error al cambiar lectura:', err);
    }
  }, []);

  const toggleSelectAll = () => {
    setSelectedIds(prev =>
      prev.length === mails.length
        ? []
        : mails.map(m => m.id).filter(Boolean)
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
      .obtenerDestacados(currentPage, mailsPerPage)
      .then(({ emails = [], total = 0 }) => {
        setMails(emails);
        setTotalMails(total);
        setSelectedIds([]);
      })
      .catch(err => {
        console.error('❌ Error al obtener destacados:', err);
      });
  }, [user, currentPage]);

  return (
    <MailboxLayout
      allSelected={selectedIds.length === mails.length && mails.length > 0}
      someSelected={selectedIds.length > 0 && selectedIds.length < mails.length}
      selected={selectedIds}
      onSelectAll={toggleSelectAll}
      onMarkAllRead={() => {}}
      currentPage={currentPage}
      totalMails={totalMails}
      onPrevPage={() => setCurrentPage(p => Math.max(p - 1, 1))}
      onNextPage={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
    >
      {Array.isArray(mails) && mails.length > 0 ? (
        mails.map(mail =>
          mail?.id && (
            <MailCard
              key={mail.id}
              mail={mail}
              selected={selectedIds.includes(mail.id)}
              onToggle={() => toggleSelectOne(mail.id)}
              isSent={false}
              onToggleFavorite={toggleFavorite}
              onMarkRead={marcarComoLeidoIndividual}
            />
          )
        )
      ) : (
        <div className="no-mails">No hay correos destacados.</div>
      )}
    </MailboxLayout>
  );
}
