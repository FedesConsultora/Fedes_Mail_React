import React, { useEffect, useRef, useState } from 'react';
import {
  FaTimes, FaWindowMinimize, FaExpand,
  FaPaperclip, FaFilePdf, FaFileImage, FaFileAlt
} from 'react-icons/fa';
import { IoMdHappy } from 'react-icons/io';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import api from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { useUser } from '../contexts/UserContext';

const MAX_MB = 25;
const MAX_B = MAX_MB * 1024 * 1024;

export default function ComposeModal({
  onClose,
  initialData = {},
  modo = 'modal',
  onSend = null,
  preloadedFiles = [],
}) {
  const hasInitialized = useRef(false);
  const { showToast } = useToast();
  const { user } = useUser();
  const textareaRef = useRef();

  const [form, setForm] = useState({
    to: initialData.to || '',
    cc: '',
    cco: '',
    subject: initialData.subject || '',
    body: '',
  });

  const [showCc, setShowCc] = useState(false);
  const [showCco, setShowCco] = useState(false);
  const [files, setFiles] = useState([]);
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending, setSending] = useState(false);
  const [incluirFirma, setIncluirFirma] = useState(() =>
    localStorage.getItem('firma_activa') !== 'false'
  );
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  const isReply = modo === 'respuesta';

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  useEffect(() => {
    if (!hasInitialized.current) {
      const firma = incluirFirma && user?.firma_html ? `<br/><br/>${user.firma_html}` : '';
      setForm({
        to: initialData.to || '',
        cc: initialData.cc || '',
        cco: initialData.cco || '',
        subject: initialData.subject || '',
        body: (initialData.body || '') + firma,
      });
      setShowCc(!!initialData.cc);
      setShowCco(!!initialData.cco);
      setFiles([]);
      hasInitialized.current = true;
    }
  }, [initialData, incluirFirma, user?.firma_html]);

  useEffect(() => {
    if (!preloadedFiles.length) return;
    setFiles(prev =>
      [...prev, ...preloadedFiles.filter(
        p => !prev.some(f => f.file.name === p.file.name && f.file.size === p.file.size)
      )]
    );
  }, [preloadedFiles]);

  const prevent = e => e.preventDefault();
  const onDrop = e => {
    e.preventDefault();
    processFiles(Array.from(e.dataTransfer.files));
  };

  async function processFiles(list) {
    const nuevos = [];
    for (const file of list) {
      if (files.some(f => f.file.name === file.name && f.file.size === file.size)) continue;
      if (file.size + totalSize > MAX_B) {
        showToast({ message: `📁 '${file.name}' sobrepasa los ${MAX_MB} MB`, type: 'warning' });
        continue;
      }
      const base64 = await toB64(file);
      nuevos.push({ file, base64, url: URL.createObjectURL(file) });
    }
    setFiles(f => [...f, ...nuevos]);
  }

  const toB64 = file => new Promise(res => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.readAsDataURL(file);
  });

  const doSend = async () => {
    if (!form.to || !form.subject) {
      return showToast({ message: '⚠️ «Para» y «Asunto» son obligatorios', type: 'warning' });
    }
    if (totalSize > MAX_B) {
      return showToast({ message: `⚠️ Adjuntos superan los ${MAX_MB} MB`, type: 'warning' });
    }

    const attachments = files.map(({ file, base64 }) => ({
      name: file.name,
      mimetype: file.type || 'application/octet-stream',
      base64,
      size: file.size
    }));

    if (typeof onSend === 'function') {
      return onSend({ ...form, attachments });
    }

    setSending(true);
    const { success, error } = await api.enviarCorreo({
      to: form.to,
      cc: form.cc,
      cco: form.cco,
      subject: form.subject,
      html: form.body,
      text: form.body,
      attachments,
      tipo: 'nuevo'
    });

    setSending(false);
    if (success) {
      showToast({ message: '📨 Correo enviado', type: 'success' });
      onClose();
    } else {
      showToast({ message: `❌ ${error}`, type: 'error' });
    }
  };

  const insertEmoji = e => {
    const t = textareaRef.current;
    const { selectionStart: s, selectionEnd: eIdx } = t;
    const txt = form.body.slice(0, s) + e.native + form.body.slice(eIdx);
    setForm({ ...form, body: txt });
    requestAnimationFrame(() => {
      t.focus();
      t.selectionStart = t.selectionEnd = s + e.native.length;
    });
  };

  const quitarFirmaDelBody = () => {
    if (!user?.firma_html) return form.body;
    const firmaRegex = new RegExp(`<br/><br/>${user.firma_html.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
    return form.body.replace(firmaRegex, '');
  };

  const handleFirmaToggle = e => {
    const checked = e.target.checked;
    setIncluirFirma(checked);
    localStorage.setItem('firma_activa', checked);
    setForm(prev => ({
      ...prev,
      body: checked && user?.firma_html
        ? quitarFirmaDelBody() + `<br/><br/>${user.firma_html}`
        : quitarFirmaDelBody()
    }));
  };
  return (
    <div
      className={`compose-modal ${modo === 'respuesta' ? 'embedded' : ''}`}
      onDragOver={prevent}
      onDrop={onDrop}
    >
      {!isReply && (
        <div className="header">
          <span>Mensaje nuevo</span>
          <div className="header-actions">
            <FaWindowMinimize title="Minimizar" />
            <FaExpand title="Expandir" />
            <FaTimes onClick={onClose} title="Cerrar" />
          </div>
        </div>
      )}

      <div className="fields">
        <div className="to-line">
          <input name="to" placeholder="Para" value={form.to} onChange={change} />
          <span onClick={() => setShowCc(!showCc)}>CC</span>
          <span onClick={() => setShowCco(!showCco)}>CCO</span>
        </div>
        {showCc && <input name="cc" placeholder="CC" value={form.cc} onChange={change} />}
        {showCco && <input name="cco" placeholder="CCO" value={form.cco} onChange={change} />}
        <input name="subject" placeholder="Asunto" value={form.subject} onChange={change} />
      </div>

      {/* Firma toggle */}
      <div className="firma-toggle">
        <label>
          <input type="checkbox" checked={incluirFirma} onChange={handleFirmaToggle} />
          Incluir firma
        </label>
      </div>

      <textarea
        ref={textareaRef}
        name="body"
        placeholder="Escribí tu mensaje…"
        value={form.body}
        onChange={change}
      />

      {files.length > 0 && (
        <div className="attachments-preview">
          {files.map(({ file, url }, i) => (
            <div key={i} className="att-chip">
              {file.type.startsWith('image/')
                ? <FaFileImage />
                : file.type === 'application/pdf'
                  ? <FaFilePdf />
                  : <FaFileAlt />}
              <a href={url} download={file.name} className="filename">{file.name}</a>
              <span className="size">({(file.size / 1024).toFixed(0)} KB)</span>
              <FaTimes className="rm-btn" onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))} />
            </div>
          ))}
          <div className="total">
            Usado {(totalSize / 1024 / 1024).toFixed(1)} MB / {MAX_MB} MB
          </div>
        </div>
      )}

      <div className="footer">
        <button
          className="send-btn"
          disabled={sending || totalSize > MAX_B}
          onClick={doSend}
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>

        <div className="footer-icons">
          <label className="icon-btn">
            <FaPaperclip title="Adjuntar archivo" />
            <input
              type="file"
              multiple
              style={{ display: 'none' }}
              onChange={e => processFiles(Array.from(e.target.files))}
            />
          </label>
          <IoMdHappy title="Emoji" onClick={() => setShowEmoji(!showEmoji)} />
        </div>
      </div>

      {showEmoji && (
        <div className="emoji-popover">
          <Picker data={data} onEmojiSelect={insertEmoji} theme="light" />
        </div>
      )}
    </div>
  );
}
