import React, { useState, useEffect, useMemo } from 'react';
import MailCard from '../components/MailCard';
import MailboxLayout from '../layouts/MailboxLayout';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';
import { useToast } from '../contexts/ToastContext';
import { useLocation } from 'react-router-dom';
import Loader from '../components/Loader';
import NoMails from '../components/NoMails';

export default function Inbox() {
  const { user } = useUser();
  const { showToast } = useToast();
  const location = useLocation();

  const [mails, setMails] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalMails, setTotalMails] = useState(0);
  const [loadingMails, setLoadingMails] = useState(true);

  const mailsPerPage = 50;
  const currentFolder = location.pathname.includes('/trash') ? 'trash' : 'inbox';

  useEffect(() => {
    if (!user?.email) return;

    setLoadingMails(true);
    api
      .obtenerInbox(user.email, currentPage, mailsPerPage)
      .then(({ emails = [], total = 0 }) => {
        setMails(emails);
        setTotalMails(total);
        setSelectedIds([]);
      })
      .catch((err) => {
        console.error('❌ Error al obtener inbox:', err);
        showToast({ message: '❌ Error al cargar correos', type: 'error' });
      })
      .finally(() => setLoadingMails(false));
  }, [user?.email, currentPage, showToast]);

  const toggleFavorite = async (id, nuevoEstado) => {
    try {
      await api.setState({
        folder: currentFolder,
        mail_ids: [id],
        state: { favorite: nuevoEstado },
      });
      setMails((curr) =>
        curr.map((m) => (m.id === id ? { ...m, favorite: nuevoEstado } : m))
      );
    } catch {
      showToast({ message: '❌ Error al actualizar favoritos.', type: 'error' });
    }
  };
  const forzarActualizacion = async () => {
    setLoadingMails(true);
    try {
      console.log('🔄 Forzando actualización de inbox...');
      await api.forzarActualizacionInbox();
      const { emails = [], total = 0 } = await api.obtenerInbox(user.email, 1, mailsPerPage);

      console.log('📩 Emails recibidos:', emails.length);
      if (emails.length) {
        const mail = emails[0];
        console.log('↪ remitente:', mail.de);
        console.log('↪ asunto:', mail.asunto);
        console.log('↪ return_path:', mail.return_path);
        console.log('↪ reply_to:', mail.reply_to);
        console.log('↪ sender:', mail.sender);
        console.log('↪ responde_a_id:', mail.responde_a_id);
        console.log('↪ referencias:', mail.referencias);
        console.log('↪ mime_version:', mail.mime_version);
        console.log('↪ x_google_smtp_source:', mail.x_google_smtp_source);
        console.log('↪ x_gm_message_state:', mail.x_gm_message_state);
        console.log('↪ dkim_signature:', mail.dkim_signature);
      }

      setMails(emails);
      setTotalMails(total);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error('❌ Error al forzar actualización:', err);
      showToast({ message: '❌ Error al forzar actualización', type: 'error' });
    } finally {
      setLoadingMails(false);
    }
  };

  const marcarComoLeidoIndividual = async (id, is_read = true) => {
    try {
      await api.setState({
        folder: currentFolder,
        mail_ids: [id],
        state: { is_read },
      });
      setMails((curr) =>
        curr.map((m) =>
          m.id === id ? { ...m, is_read, state: is_read ? 'read' : 'unread' } : m
        )
      );
    } catch {
      showToast({ message: '❌ Error al cambiar lectura.', type: 'error' });
    }
  };

  const toggleLecturaSeleccionados = async () => {
    if (!selectedIds.length) return;
    const hayNoLeidos = mails.some((m) => selectedIds.includes(m.id) && !m.is_read);
    const nuevoEstado = hayNoLeidos;

    try {
      await api.setState({
        folder: currentFolder,
        mail_ids: selectedIds,
        state: { is_read: nuevoEstado },
      });

      setMails((curr) =>
        curr.map((m) =>
          selectedIds.includes(m.id)
            ? { ...m, is_read: nuevoEstado, state: nuevoEstado ? 'read' : 'unread' }
            : m
        )
      );
      setSelectedIds([]);
      showToast({
        message: `✅ ${selectedIds.length} correo(s) marcados como ${nuevoEstado ? 'leídos' : 'no leídos'}`,
        type: 'success',
      });
    } catch {
      showToast({ message: '❌ Error al marcar como leído.', type: 'error' });
    }
  };

  const eliminarCorreoLocal = (id) => {
    setMails((curr) => curr.filter((m) => m.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setTotalMails((prev) => Math.max(prev - 1, 0));
  };

  const eliminarSeleccionados = async () => {
    if (!selectedIds.length) return;

    try {
      const res = await api.deleteMails({ folder: currentFolder, mail_ids: selectedIds });

      if (res?.deleted > 0) {
        setMails((curr) => curr.filter((m) => !selectedIds.includes(m.id)));
        setSelectedIds([]);
        setTotalMails((prev) => Math.max(prev - res.deleted, 0));
        showToast({ message: `🗑️ ${res.deleted} correo(s) eliminados`, type: 'warning' });
      } else {
        showToast({ message: '⚠️ No se eliminaron correos', type: 'info' });
      }
    } catch {
      showToast({ message: '❌ Error al eliminar correos.', type: 'error' });
    }
  };

  const isAllSelected = selectedIds.length === mails.length && mails.length > 0;
  const isSomeSelected = selectedIds.length > 0 && !isAllSelected;
  const todosLeidos = useMemo(
    () => selectedIds.every((id) => mails.find((m) => m.id === id)?.is_read),
    [selectedIds, mails]
  );
  const totalPages = useMemo(
    () => Math.ceil(totalMails / mailsPerPage),
    [totalMails]
  );

  const toggleSelectAll = () => {
    setSelectedIds((prev) =>
      prev.length === mails.length ? [] : mails.map((m) => m.id).filter(Boolean)
    );
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  if (loadingMails) return <Loader message="Cargando correos…" />;

  return (
    <MailboxLayout
      allSelected={isAllSelected}
      someSelected={isSomeSelected}
      onSelectAll={toggleSelectAll}
      selected={selectedIds}
      isRead={todosLeidos}
      currentPage={currentPage}
      totalMails={totalMails}
      onReload={forzarActualizacion}
      onDeleteMultiple={eliminarSeleccionados}
      onToggleRead={toggleLecturaSeleccionados}
      onPrevPage={() => setCurrentPage((p) => Math.max(p - 1, 1))}
      onNextPage={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
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
              onToggleFavorite={toggleFavorite}
              onMarkRead={marcarComoLeidoIndividual}
              onDeleteMail={eliminarCorreoLocal}
            />
          ) : null
        )
      ) : (
          <NoMails mensaje="No hay correos en inbox." />
      )}
    </MailboxLayout>
  );
}
