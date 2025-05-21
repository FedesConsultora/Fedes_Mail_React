// src/components/ReplyForwardButtons.jsx

export default function ReplyForwardButtons({ onReply, onForward }) {
  return (
    <div className="reply-forward-actions">
      <button className="action-btn reply" onClick={onReply}>
        Responder
      </button>
      <button className="action-btn forward" onClick={onForward}>
        Reenviar
      </button>
    </div>
  );
}
