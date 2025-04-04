import React from 'react';
import { FaRegStar, FaStar } from 'react-icons/fa';

const MailCard = ({ mail, selected, onToggle }) => {
  const isToday = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return isToday(dateStr)
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
  };

  return (
    <div className={`mail-card ${mail.state}`}>
      <div className="mail-row">
        <input type="checkbox" checked={selected} onChange={onToggle} />
        <button className="starBtn" title="Destacar">
          {mail.favorite ? <FaStar /> : <FaRegStar />}
        </button>
        <strong className="mail-sender">{mail.sender}</strong>
        <span className="mail-subject">{mail.subject}</span>
        <span
          className="mail-snippet"
          dangerouslySetInnerHTML={{ __html: mail.body.slice(0, 80) }}
        />
        <span className="mail-date">{formatDate(mail.date)}</span>
      </div>
    </div>
  );
};

export default MailCard;
