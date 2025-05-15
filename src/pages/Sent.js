/*  src/pages/Sent.jsx  */
import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

export default function Sent() {
  const { user, loading } = useUser();
  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const mailsPerPage = 50;
  const [totalMails, setTotalMails] = useState(0);

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
      console.error('❌ Error al actualizar favorito:', err);
    }
  }
  
  /* --- MARCAR LEÍDO / NO LEÍDO --- */
  async function marcarComoLeidoIndividual(id, is_read = true) {
    try {
      await api.setState({
        folder: 'sent',
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
  /* --- carga de enviados --- */
  useEffect(() => {
    if (!loading) {
      api
        .obtenerEnviados(currentPage, mailsPerPage)
        .then((res) => {
          setMails(Array.isArray(res?.emails) ? res.emails : []);
          setTotalMails(typeof res?.total === 'number' ? res.total : 0);
          setSelectedIds([]);
        })
        .catch(console.error);
    }
  }, [loading, currentPage]);

  /* --- helpers selección --- */
  const totalPages = Math.ceil(totalMails / mailsPerPage);

  const toggleSelectAll = () =>
    setSelectedIds(
      selectedIds.length === mails.length
        ? []
        : mails.map((m) => m.id).filter(Boolean)
    );

  const toggleSelectOne = (id) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  /* --- render --- */
  if (loading) return <div>Cargando usuario…</div>;

  return (
    <MailboxLayout
      allSelected={selectedIds.length === mails.length && mails.length > 0}
      someSelected={selectedIds.length > 0 && selectedIds.length < mails.length}
      onSelectAll={toggleSelectAll}
      onMarkAllRead={() => {}}             /* opcional: lógica propia */
      selected={selectedIds.length > 0}
      currentPage={currentPage}
      totalMails={totalMails}
      onPrevPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
    >
      {mails.length > 0 ? (
        mails.map(
          (mail) =>
            mail?.id && (
              <MailCard
                key={mail.id}
                mail={mail}
                selected={selectedIds.includes(mail.id)}
                onToggle={() => toggleSelectOne(mail.id)}
                isSent={true}
                onToggleFavorite={toggleFavorite}
                onMarkRead={marcarComoLeidoIndividual}
              />
            )
        )
      ) : (
        <div className="no-mails">No hay correos enviados.</div>
      )}
    </MailboxLayout>
  );
}
