import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaWindowMinimize, FaExpand } from 'react-icons/fa';
import { IoMdAttach, IoMdHappy, IoMdLink } from 'react-icons/io';
import { MdOutlineImage, MdOutlineDraw } from 'react-icons/md';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import api from '../services/api'; 
import { useToast } from '../contexts/ToastContext';

export default function ComposeModal({ onClose }) {
  /* ---------- estado ---------- */
  const [form, setForm] = useState({ to: '', cc: '', cco: '', subject: '', body: '' });
  const [showCc, setShowCc] = useState(false);
  const [showCco, setShowCco] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();

  /* ---------- emoji drag ---------- */
  const [emojiPosition, setEmojiPosition] = useState(() => {
    const saved = localStorage.getItem('emojiPosition');
    return saved ? JSON.parse(saved) : { x: 300, y: 300 };
  });
  const emojiPickerRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef();

  /* ---------- helpers ---------- */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSend = async () => {
    if (!form.to || !form.subject) {
      showToast({ message: '⚠️ Completá los campos "Para" y "Asunto"', type: 'warning' });
      return;
    }

    setSending(true);

    const { success, error } = await api.enviarCorreo({
      to: form.to,
      subject: form.subject,
      html: form.body,
      text: form.body,
    });

    setSending(false);
    if (success) {
      showToast({ message: '📨 Correo enviado con éxito', type: 'success' });
      onClose();
    } else {
      showToast({ message: `❌ Error al enviar: ${error}`, type: 'error' });
    }
  };


  const handleEmojiSelect = (emoji) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newText = form.body.slice(0, start) + emoji.native + form.body.slice(end);
    setForm({ ...form, body: newText });
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + emoji.native.length;
    }, 0);
  };

  const handleMouseDown = (e) => {
    if (!e.target.classList.contains('emoji-drag-bar')) return;

    const picker = emojiPickerRef.current;
    const rect = picker.getBoundingClientRect();

    dragOffset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setDragging(true);
  };

  const handleMouseMove = (e) => {
    if (!dragging) return;

    const newX = e.clientX - dragOffset.current.x;
    const newY = e.clientY - dragOffset.current.y;

    setEmojiPosition({ x: newX, y: newY });
    localStorage.setItem('emojiPosition', JSON.stringify({ x: newX, y: newY }));
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'auto';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div className="compose-modal">
      <div className="header">
        <span className="mensajeNuevo">Mensaje nuevo</span>
        <div className="header-actions">
          <FaWindowMinimize title="Minimizar" />
          <FaExpand title="Expandir" />
          <FaTimes onClick={onClose} title="Cerrar" />
        </div>
      </div>

      <div className="fields">
        <div className="to-line">
          <input type="email" name="to" value={form.to} onChange={handleChange} placeholder="Para" />
          <span className="cc-cco-toggle" onClick={() => setShowCc(!showCc)}>CC</span>
          <span className="cc-cco-toggle" onClick={() => setShowCco(!showCco)}>CCO</span>
        </div>
        {showCc && (
          <input type="email" name="cc" value={form.cc} onChange={handleChange} placeholder="CC" />
        )}
        {showCco && (
          <input type="email" name="cco" value={form.cco} onChange={handleChange} placeholder="CCO" />
        )}
        <input type="text" name="subject" value={form.subject} onChange={handleChange} placeholder="Asunto" />
      </div>

      <textarea
        name="body"
        value={form.body}
        onChange={handleChange}
        ref={textareaRef}
        placeholder="Escribí tu mensaje..."
      />

      <div className="footer">
        <button className="send-btn" onClick={handleSend} disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
        <div className="footer-icons">
          <IoMdAttach title="Adjuntar archivo" />
          <MdOutlineImage title="Insertar imagen" />
          <div className="emoji-wrapper">
            <IoMdHappy title="Insertar emoji" onClick={() => setShowEmojiPicker(!showEmojiPicker)} />
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="emoji-popover"
                style={{
                  top: emojiPosition.y,
                  left: emojiPosition.x,
                  position: 'fixed',
                  zIndex: 1000,
                  opacity: dragging ? 0.7 : 1,
                  transition: dragging ? 'none' : 'opacity 0.2s ease',
                  pointerEvents: 'auto'
                }}
              >
                <div
                  className="emoji-drag-bar"
                  onMouseDown={handleMouseDown}
                  style={{
                    cursor: 'grab',
                    background: '#f1f1f1',
                    padding: '6px 12px',
                    borderBottom: '1px solid #ccc'
                  }}
                >
                  😄 Emoji
                </div>
                <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" emojiTooltip />
              </div>
            )}
          </div>
          <IoMdLink title="Insertar vínculo" />
          <MdOutlineDraw title="Insertar firma" />
        </div>
      </div>
    </div>
  );
}
