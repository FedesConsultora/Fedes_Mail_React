import React, { useEffect, useRef, useState } from 'react';
import {
  FaTimes, FaWindowMinimize, FaExpand, FaCompress,
  FaPaperclip, FaFilePdf, FaFileImage, FaFileAlt, FaPenFancy
} from 'react-icons/fa';
import { IoMdHappy } from 'react-icons/io';
import Picker from '@emoji-mart/react';
import data   from '@emoji-mart/data';

import api            from '../services/api';
import { useToast }   from '../contexts/ToastContext';
import { useUser }    from '../contexts/UserContext';
import { textToHtml } from '../utils/textToHtml';

import MultiEmailInput from './MultiEmailInput';

/* ---------- helpers ---------- */
const EMAIL_RE = /^[\w.!#$%&’*+/=?^`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
const isValidEmail = (s) => EMAIL_RE.test(s.trim());

/* simple “useEffectOnce” si no tenés react-use */
const useEffectOnce = (fn) => useEffect(fn, []);
/* -------------------------------------------- */

const MAX_MB = 25;
const MAX_B  = MAX_MB * 1024 * 1024;

export default function ComposeModal({
  onClose,
  initialData   = {},
  modo          = 'modal',             // 'modal' | 'respuesta'
  onSend        = null,
  preloadedFiles = [],
  mostrarFirma,
  setMostrarFirma,
}) {
  const { showToast } = useToast();
  const { user }      = useUser();
  const textareaRef   = useRef();
  const hasInit       = useRef(false);

  /* -------------------- estado principal -------------------- */
  const [form, setForm] = useState({
    to: '', cc: '', cco: '', subject: '', body: ''
  });

  /* visibilidad CC/CCO */
  const [showCc,  setShowCc]  = useState(false);
  const [showCco, setShowCco] = useState(false);

  /* adjuntos + emoji */
  const [files,      setFiles]      = useState([]);
  const [showEmoji,  setShowEmoji]  = useState(false);

  /* firma & flags ventana */
  const [sending,   setSending]   = useState(false);
  const [fullscreen,setFullscreen]= useState(false);
  const [minimized, setMinimized] = useState(false);

  const [firmaVisible, setFirmaVisible] = useState(
    () => localStorage.getItem('firma_activa') !== 'false'
  );

  /* sugerencias de autocompletado */
  const [suggestions, setSuggestions] = useState([]);     //  ← NUEVO

  /* invalid flags por campo */
  const [invalidFlags, setInvalidFlags] = useState({ to:false, cc:false, cco:false });
  const hasInvalid = Object.values(invalidFlags).some(Boolean);

  /* -------------- helpers --------------- */
  const totalSize   = files.reduce((a,f)=>a+f.file.size,0);
  const isReply     = modo === 'respuesta';
  const visibleFirma =
    typeof mostrarFirma === 'boolean' ? mostrarFirma : firmaVisible;

  /* ---------- init con props ---------- */
  useEffect(() => {
    if (hasInit.current) return;
    setForm({
      to     : initialData.to  || '',
      cc     : initialData.cc  || '',
      cco    : initialData.cco || '',
      subject: initialData.subject || '',
      body   : '',
    });
    setShowCc(!!initialData.cc);
    setShowCco(!!initialData.cco);
    hasInit.current = true;
  }, [initialData]);

  /* ---------- traer sugeridos una sola vez ---------- */
  useEffectOnce(() => {
    api.obtenerSugerencias()
       .then(arr =>
         setSuggestions(arr.map(({name, email}) => ({
           label : name || email.split('@')[0],   // cómo querés mostrarlo
           email,
         })))
       )
       .catch(()=>{/* noop */});
  });

  /* ---------- files pre-cargados ---------- */
  useEffect(() => {
    if (!preloadedFiles.length) return;
    setFiles((prev) => [
      ...prev,
      ...preloadedFiles.filter(
        p => !prev.some(f => f.file.name===p.file.name && f.file.size===p.file.size)
      ),
    ]);
  }, [preloadedFiles]);

  /* ----- email chips → form + flags ----- */
  const onEmailsChange = (field) => (list) => {
    setForm((f) => ({ ...f, [field]: list.join(',') }));
    setInvalidFlags((f) => ({
      ...f,
      [field]: list.some((e) => !isValidEmail(e)),
    }));
  };

  /* --------------- drag’n’drop --------------- */
  const prevent = (e) => e.preventDefault();

  const onDrop = (e) => {
    e.preventDefault();
    processFiles(Array.from(e.dataTransfer.files));
  };

  async function processFiles(list) {
    const nuevos = [];
    for (const file of list) {
      if (files.some(f => f.file.name===file.name && f.file.size===file.size)) continue;
      if (file.size + totalSize > MAX_B) {
        showToast({ message:`📁 '${file.name}' sobrepasa los ${MAX_MB} MB`, type:'warning' });
        continue;
      }
      const base64 = await toB64(file);
      nuevos.push({ file, base64, url:URL.createObjectURL(file) });
    }
    setFiles((f) => [...f, ...nuevos]);
  }

  const toB64 = (file) => new Promise((res)=>{
    const r = new FileReader();
    r.onload = () => res(r.result.split(',')[1]);
    r.readAsDataURL(file);
  });

  /* ----------------- send ----------------- */
  const doSend = async () => {

    if (hasInvalid) {
      showToast({ message:'⚠️ Corregí las direcciones en rojo', type:'warning' });
      return;
    }
    if (!form.to.trim() || !form.subject.trim()) {
      showToast({ message:'⚠️ «Para» y «Asunto» son obligatorios', type:'warning' });
      return;
    }
    if (totalSize > MAX_B) {
      showToast({ message:`⚠️ Adjuntos superan los ${MAX_MB} MB`, type:'warning' });
      return;
    }

    const attachments = files.map(({file,base64})=>({
      name:file.name,
      mimetype: file.type || 'application/octet-stream',
      base64,
      size:file.size,
    }));

    const htmlBody  = textToHtml(form.body);
    const htmlFinal = htmlBody + (
      !mostrarFirma && firmaVisible && user?.firma_html
        ? `<br/><br/>${user.firma_html}`
        : ''
    );

    if (typeof onSend === 'function') {
      return onSend({ ...form, attachments });
    }

    setSending(true);
    const { success, error } = await api.enviarCorreo({
      to: form.to, cc:form.cc, cco:form.cco,
      subject : form.subject,
      html    : htmlFinal,
      text    : form.body,
      attachments,
      tipo    : 'nuevo',
    });
    setSending(false);

    if (success) {
      showToast({ message:'📨 Correo enviado', type:'success' });
      onClose();
    } else {
      showToast({ message:`❌ ${error}`, type:'error' });
    }
  };

  /* ---------- firma toggle ---------- */
  const toggleFirma = () => {
    const v = !visibleFirma;
    setFirmaVisible(v);
    if (typeof setMostrarFirma === 'function') {
      setMostrarFirma(v);
    } else {
      localStorage.setItem('firma_activa', v);
    }
  };

  /* ---------- UI helpers ---------- */
  const toggleFullscreen = () => { setFullscreen(!fullscreen); setMinimized(false); };
  const toggleMinimize   = () => { setMinimized(true);        setFullscreen(false); };

  /* ---------- emoji ---------- */
  const insertEmoji = (e) => {
    const t = textareaRef.current;
    if (!t) return;
    const { selectionStart:s, selectionEnd:eIdx } = t;
    const txt = form.body.slice(0,s) + e.native + form.body.slice(eIdx);
    setForm({...form, body:txt});
    requestAnimationFrame(()=>{
      t.focus();
      t.selectionStart = t.selectionEnd = s + e.native.length;
    });
  };

  /* ------------------------------ RENDER ------------------------------ */
  if (minimized) {
    return (
      <div className="compose-tab-minimized">
        <span>Nuevo mensaje</span>
        <div className="actions">
          <FaExpand title="Restaurar" onClick={()=>{setMinimized(false);setFullscreen(false);}} />
          <FaTimes  title="Cerrar"    onClick={onClose} />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`compose-modal ${isReply?'embedded':''} ${fullscreen?'fullscreen':''}`}
        onDragOver={prevent}
        onDrop={onDrop}
      >
        {/* ───────── header ───────── */}
        {!isReply && (
          <div className="header">
            <span>Mensaje nuevo</span>
            <div className="header-actions">
              <FaWindowMinimize onClick={toggleMinimize} title="Minimizar" />
              {fullscreen
                ? <FaCompress onClick={toggleFullscreen} title="Restaurar" />
                : <FaExpand   onClick={toggleFullscreen} title="Expandir"  />}
              <FaTimes onClick={onClose} title="Cerrar" />
            </div>
          </div>
        )}

        {/* ───────── campos Para / CC / CCO ───────── */}
        <div className="fields">

          <div className="to-line">
            <MultiEmailInput
              initialEmails={form.to.split(',').filter(Boolean)}
              placeholder="Para"
              suggestions={suggestions}
              onChange={onEmailsChange('to')}
            />
            <span onClick={()=>setShowCc(!showCc)}>CC</span>
            <span onClick={()=>setShowCco(!showCco)}>CCO</span>
          </div>

          {showCc && (
            <MultiEmailInput
              initialEmails={form.cc.split(',').filter(Boolean)}
              placeholder="CC"
              suggestions={suggestions}
              onChange={onEmailsChange('cc')}
            />
          )}

          {showCco && (
            <MultiEmailInput
              initialEmails={form.cco.split(',').filter(Boolean)}
              placeholder="CCO"
              suggestions={suggestions}
              onChange={onEmailsChange('cco')}
            />
          )}

          <input
            name="subject"
            placeholder="Asunto"
            value={form.subject}
            onChange={(e)=>setForm({...form, subject:e.target.value})}
          />
        </div>

        {/* ───────── cuerpo ───────── */}
        <textarea
          ref={textareaRef}
          name="body"
          placeholder="Escribí tu mensaje…"
          value={form.body}
          onChange={(e)=>setForm({...form, body:e.target.value})}
        />

        {/* ───────── firma ───────── */}
        {visibleFirma && user?.firma_html && (
          <div
            className="firma-preview-html"
            dangerouslySetInnerHTML={{ __html:user.firma_html }}
          />
        )}

        {/* ───────── adjuntos ───────── */}
        {files.length>0 && (
          <div className="attachments-preview">
            {files.map(({file,url},i)=>(
              <div key={i} className="att-chip">
                {file.type.startsWith('image/')
                  ? <FaFileImage/>
                  : file.type==='application/pdf'
                    ? <FaFilePdf/>
                    : <FaFileAlt/>}
                <a href={url} download={file.name} className="filename">{file.name}</a>
                <span className="size">({(file.size/1024).toFixed(0)} KB)</span>
                <FaTimes className="rm-btn"
                  onClick={()=>setFiles(f=>f.filter((_,idx)=>idx!==i))}/>
              </div>
            ))}
            <div className="total">
              Usado {(totalSize/1024/1024).toFixed(1)} MB / {MAX_MB} MB
            </div>
          </div>
        )}

        {/* ───────── footer ───────── */}
        <div className="footer">
          <button
            className="send-btn"
            disabled={
              sending || totalSize>MAX_B || hasInvalid || !form.to.trim()
            }
            onClick={doSend}
          >
            {sending ? 'Enviando…' : 'Enviar'}
          </button>

          <div className="footer-icons">
            <label className="icon-btn">
              <FaPaperclip title="Adjuntar archivo" />
              <input
                type="file" multiple style={{display:'none'}}
                onChange={(e)=>processFiles(Array.from(e.target.files))}
              />
            </label>
            <FaPenFancy
              title={visibleFirma?'Quitar firma':'Agregar firma'}
              className={`icon-btn firma-toggle ${visibleFirma?'active':''}`}
              onClick={toggleFirma}
            />
            <IoMdHappy title="Emoji" onClick={()=>setShowEmoji(p=>!p)} />
          </div>
        </div>

        {/* pop-up emoji */}
        {showEmoji && (
          <div className="emoji-popover">
            <Picker data={data} onEmojiSelect={insertEmoji} theme="light" />
          </div>
        )}
      </div>

      {fullscreen && <div className="compose-overlay" onClick={toggleFullscreen} />}
    </>
  );
}