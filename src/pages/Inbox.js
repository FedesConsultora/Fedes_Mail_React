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
  console.log('mails', mails);
  useEffect(() => {
    if (user && user.email) {
      api.obtenerInbox(user.email, currentPage, mailsPerPage)
        .then(({ emails, total }) => {
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
      setSelectedIds([]); // Deselecciono todo
    } else {
      setSelectedIds(mails.map(mail => mail.id)); // Selecciono todos
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const marcarTodosComoLeidos = () => {
    const updated = mails.map(mail =>
      selectedIds.includes(mail.id) ? { ...mail, state: 'read' } : mail
    );
    setMails(updated);
    // Aquí luego puedes agregar lógica adicional para informar al backend si lo deseas
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
      onMarkAllRead={marcarTodosComoLeidos}
      selected={isAnySelected}
      currentPage={currentPage}
      totalMails={totalMails}
      onPrevPage={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
      onNextPage={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
    >
      {mails.map(mail => (
        <MailCard
          key={mail.id}
          mail={mail}
          selected={selectedIds.includes(mail.id)}
          onToggle={() => toggleSelectOne(mail.id)}
        />
      ))}
    </MailboxLayout>
  );
}
