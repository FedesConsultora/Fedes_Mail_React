/*  src/components/ComposeModal.jsx  */
import React, { useState, useRef } from 'react';
import {
  FaTimes, FaWindowMinimize, FaExpand, FaTrash,
  FaPaperclip, FaFilePdf, FaFileImage, FaFileAlt
} from 'react-icons/fa';
import { IoMdHappy } from 'react-icons/io';
import Picker from '@emoji-mart/react';
import data   from '@emoji-mart/data';
import api    from '../services/api';
import { useToast } from '../contexts/ToastContext';

const MAX_MB = 25;
const MAX_B  = MAX_MB * 1024 * 1024;

/* ───────────────────────────────────────────────────────── */

export default function ComposeModal({ onClose }) {
  /* ────────────── formulario ────────────── */
  const [form, setForm] = useState({ to:'', cc:'', cco:'', subject:'', body:'' });
  const [showCc,  setShowCc ] = useState(false);
  const [showCco, setShowCco] = useState(false);

  /* ────────────── adjuntos ────────────── */
  const [files, setFiles] = useState([]);         // {file, base64, url}
  const totalSize = files.reduce((acc,f)=>acc+f.file.size,0);

  /* ────────────── UX ────────────── */
  const [showEmoji, setShowEmoji] = useState(false);
  const [sending  , setSending  ] = useState(false);
  const textareaRef               = useRef();
  const { showToast } = useToast();

  /* ────────────── helpers ────────────── */
  const change = e => setForm({...form, [e.target.name]:e.target.value});

  /* =======  drag & drop  ======= */
  const prevent = e => e.preventDefault();
  const onDrop  = e =>{
    e.preventDefault();
    processFiles(Array.from(e.dataTransfer.files));
  };

  async function processFiles(list){
    const nuevos=[];
    for (const file of list){
      if (files.some(f=>f.file.name===file.name && f.file.size===file.size)) continue;
      if (file.size + totalSize > MAX_B){
        showToast({message:`📁 '${file.name}' sobrepasa el límite de ${MAX_MB} MB`, type:'warning'});
        continue;
      }
      const base64 = await toB64(file);
      nuevos.push({ file, base64, url: URL.createObjectURL(file) });
    }
    setFiles(f=>[...f, ...nuevos]);
  }

  const toB64 = file => new Promise(res=>{
    const r=new FileReader();
    r.onload=()=>res(r.result.split(',')[1]);
    r.readAsDataURL(file);
  });

  /* =======  enviar  ======= */
  const handleSend = async () =>{
    if (!form.to || !form.subject){
      return showToast({message:'⚠️ "Para" y "Asunto" son obligatorios', type:'warning'});
    }
    if (totalSize>MAX_B){
      return showToast({message:`⚠️ Adjuntos superan ${MAX_MB} MB`, type:'warning'});
    }

    setSending(true);

    const attachments = files.map(({file,base64})=>({
      name:     file.name,
      mimetype: file.type || 'application/octet-stream',
      base64,
      size:     file.size
    }));

    const { success, error } = await api.enviarCorreo({
      to: form.to,
      subject: form.subject,
      html: form.body,
      text: form.body,
      attachments
    });

    setSending(false);
    success
      ? (showToast({message:'📨 Correo enviado', type:'success'}), onClose())
      : showToast({message:`❌ ${error}`, type:'error'});
  };

  /* =======  emojis  ======= */
  const insertEmoji = e =>{
    const t = textareaRef.current;
    const {selectionStart:s, selectionEnd:eIdx} = t;
    const txt = form.body.slice(0,s)+e.native+form.body.slice(eIdx);
    setForm({...form, body:txt});
    requestAnimationFrame(()=>{
      t.focus(); t.selectionStart=t.selectionEnd=s+e.native.length;
    });
  };

  /* ────────────── render ────────────── */
  return (
    <div
      className="compose-modal"
      onDragOver={prevent}
      onDrop={onDrop}
    >
      {/* ╭─ header ────────────────────────── */}
      <div className="header">
        <span>Mensaje nuevo</span>
        <div className="header-actions">
          <FaWindowMinimize title="Minimizar"/>
          <FaExpand          title="Expandir"/>
          <FaTimes onClick={onClose} title="Cerrar"/>
        </div>
      </div>

      {/* ╭─ campos ────────────────────────── */}
      <div className="fields">
        <div className="to-line">
          <input name="to" placeholder="Para" value={form.to} onChange={change}/>
          <span onClick={()=>setShowCc(!showCc)}>CC</span>
          <span onClick={()=>setShowCco(!showCco)}>CCO</span>
        </div>
        {showCc  && <input name="cc"  placeholder="CC"  value={form.cc}  onChange={change}/>}
        {showCco && <input name="cco" placeholder="CCO" value={form.cco} onChange={change}/>}
        <input name="subject" placeholder="Asunto" value={form.subject} onChange={change}/>
      </div>

      {/* ╭─ body ──────────────────────────── */}
      <textarea
        ref={textareaRef}
        name="body"
        placeholder="Escribí tu mensaje…"
        value={form.body}
        onChange={change}
      />

      {/* ╭─ preview adjuntos ───────────────── */}
      {files.length>0 && (
        <div className="attachments-preview">
          {files.map(({file,url},i)=>(
            <div key={i} className="att-chip">
              {file.type.startsWith('image/')
                ? <FaFileImage/>
                : file.type==='application/pdf'
                  ? <FaFilePdf/>
                  : <FaFileAlt/>
              }
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                title="Vista previa"
              >
                {file.name}
              </a>
              <span> ({(file.size/1024).toFixed(0)} KB) </span>
              <a href={url} download={file.name} title="Descargar">⬇️</a>
              <FaTrash
                className="rm-btn"
                title="Quitar"
                onClick={()=>setFiles(f=>f.filter((_,idx)=>idx!==i))}
              />
            </div>
          ))}
          <div className="total">Total: {(totalSize/1024/1024).toFixed(1)} MB</div>
        </div>
      )}

      {/* ╭─ footer ────────────────────────── */}
      <div className="footer">
        <button
          className="send-btn"
          disabled={sending || totalSize>MAX_B}
          onClick={handleSend}
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>

        <div className="footer-icons">
          <label className="icon-btn">
            <FaPaperclip title="Adjuntar archivo"/>
            <input
              type="file"
              multiple
              style={{display:'none'}}
              onChange={e=>processFiles(Array.from(e.target.files))}
            />
          </label>

          <IoMdHappy title="Emoji" onClick={()=>setShowEmoji(!showEmoji)}/>
        </div>
      </div>

      {/* ╭─ emoji popover ─────────────────── */}
      {showEmoji && (
        <div className="emoji-popover">
          <Picker data={data} onEmojiSelect={insertEmoji} theme="light"/>
        </div>
      )}
    </div>
  );
}