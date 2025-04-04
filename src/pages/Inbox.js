// src/pages/Inbox.js
import React, { useState, useEffect } from 'react';
import MailCard from '../components/MailCard';
import SearchAndFilters from '../components/SearchAndFilters/SearchAndFilters';
import InboxToolbar from '../components/InboxToolbar';

export default function Inbox() {
  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    const mockMails = [
      {
        id: 1,
        subject: 'Reunión con cliente mañana',
        body: '<p>No te olvides de los puntos clave...</p>',
        sender: 'epinotti@fedes.ai',
        recipients: 'cliente@correo.com',
        cc: '',
        date: new Date().toISOString(),
        state: 'new',
        user_id: 2,
        tag_ids: [],
      },
      {
        id: 2,
        subject: 'Presupuesto aprobado ✅',
        body: '<p>¡Hola! Aprobamos el presupuesto, avancemos...</p>',
        sender: 'cliente@empresa.com',
        recipients: 'epinotti@fedes.ai',
        cc: '',
        date: new Date(Date.now() - 86400000).toISOString(),
        state: 'read',
        user_id: 2,
        tag_ids: [],
      }
    ];
    setMails(mockMails);
  }, []);

  const toggleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(mails.map(mail => mail.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="inboxContainer">
      <SearchAndFilters />
      <InboxToolbar
        allSelected={selectedIds.length === mails.length}
        onSelectAll={toggleSelectAll}
        onMarkAllRead={() => {
          const updated = mails.map(m => selectedIds.includes(m.id) ? { ...m, state: 'read' } : m);
          setMails(updated);
        }}
      />
      {mails.map(mail => (
        <MailCard
          key={mail.id}
          mail={mail}
          selected={selectedIds.includes(mail.id)}
          onToggle={() => toggleSelectOne(mail.id)}
        />
      ))}
    </div>
  );
}
