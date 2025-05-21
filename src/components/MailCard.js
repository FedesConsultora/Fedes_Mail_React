/*  src/components/MailCard.jsx  */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaRegStar, FaStar, FaTrash, FaArchive, FaEnvelope,
  FaUndoAlt, FaExclamationCircle, FaTimes, FaDownload
} from 'react-icons/fa';
import {
  AiFillFilePdf, AiFillFileImage, AiFillFileWord,
  AiFillFileExcel, AiFillFilePpt, AiFillFileZip, AiFillFile
} from 'react-icons/ai';
import api          from '../services/api';
import { useToast } from '../contexts/ToastContext';

/* ────────────── icono por extensión ────────────── */
function attIcon(name = '') {
  const ext = name.split('.').pop().toLowerCase();
  if (ext === 'pdf') return <AiFillFilePdf className="file-icon" />;
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext))
    return <AiFillFileImage className="file-icon" />;
  if (['doc', 'docx', 'odt'].includes(ext)) return <AiFillFileWord className="file-icon" />;
  if (['xls', 'xlsx', 'csv', 'ods'].includes(ext)) return <AiFillFileExcel className="file-icon" />;
  if (['ppt', 'pptx', 'odp'].includes(ext)) return <AiFillFilePpt className="file-icon" />;
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) return <AiFillFileZip className="file-icon" />;
  return <AiFillFile className="file-icon" />;
}

export default function MailCard({
  mail = {},
  selected = false,
  onToggle       = () => {},
  onMarkRead     = () => {},
  onToggleFavorite = () => {},
  onDeleteMail   = () => {},
}) {
  const nav  = useNavigate();
  const loc  = useLocation();
  const { showToast, showConfirmToast } = useToast();

  /* ───────── carpeta actual ───────── */
  const path = loc.pathname;
  const currentFolder =
    path.includes('/sent')   ? 'sent'   :
    path.includes('/trash')  ? 'trash'  :
    path.includes('/spam')   ? 'spam'   :
    path.includes('/starred')? 'starred': 'inbox';

  /* ───────── fecha ───────── */
  const isToday = d => {
    const t = new Date(), x = new Date(d);
    return x.getDate()===t.getDate() && x.getMonth()===t.getMonth() && x.getFullYear()===t.getFullYear();
  };
  const fmtDate = d =>
    isToday(d)
      ? new Date(d).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
      : new Date(d).toLocaleDateString('es-AR',{day:'2-digit',month:'short'});

  /* ───────── modal preview ───────── */
  const [previewAtt, setPreviewAtt] = useState(null);   // {nombre,url,preview,mimetype}

  /* ───────── navegación ───────── */
  function openMail(e){
    if (e.target.closest('input, button, .attachment-pill, .hover-actions')) return;
    if (!mail.id) return;
    if (!mail.is_read) onMarkRead(mail.id);

    const dest =
      currentFolder==='sent'  ? `/sent/email/${mail.id}`  :
      currentFolder==='trash' ? `/trash/email/${mail.id}` :
      currentFolder==='spam'  ? `/spam/email/${mail.id}`  : `/email/${mail.id}`;

    nav(dest, { state:{ from:currentFolder } });
  }

  /* ───────── acciones varias – mismas que tenías ───────── */
  const toggleFav  = e => { e.stopPropagation(); onToggleFavorite(mail.id,!mail.favorite); };
  const toggleRead = e => { e.stopPropagation(); onMarkRead(mail.id,!mail.is_read); };
  /* … delete, spam, restore – idénticos que ya tenías … */
  async function delMail(e){
    e.stopPropagation();
    if (currentFolder==='trash'){
      return showConfirmToast({
        message:'¿Eliminar definitivamente este correo?',
        type:'warning',
        confirmText:'Eliminar',
        onConfirm: async ()=>{
          await api.deleteMails({ folder:'trash', mail_ids:[mail.id] });
          onDeleteMail(mail.id);
          showToast({message:'🗑️ Eliminado', type:'warning'});
        }
      });
    }
    await api.deleteMails({ folder:currentFolder==='starred'?'inbox':currentFolder, mail_ids:[mail.id] });
    onDeleteMail(mail.id);
    showToast({message:'🗑️ Correo a papelera', type:'warning'});
  }
  const spam = async e => { e.stopPropagation(); await api.marcarComoSpam([mail.id]); onDeleteMail(mail.id); showToast({message:'🚫 Movido a Spam', type:'warning'}); };
  const noSpam = async e => { e.stopPropagation(); showConfirmToast({ message:'¿Sacar de Spam?', type:'warning', confirmText:'Mover', onConfirm:async()=>{ await api.marcarComoNoSpam([mail.id]); onDeleteMail(mail.id); showToast({message:'📥 Recuperado', type:'success'});} }); };
  const restore = async e => { e.stopPropagation(); await api.restoreMails([mail.id]); onDeleteMail(mail.id); showToast({message:'♻️ Restaurado', type:'success'}); };

  /* ───────── render ───────── */
  return (
    <>
      <div className={`mail-card ${mail.state||''}`} onClick={openMail}>
        {/* ── fila principal ── */}
        <div className="mail-row">
          <input type="checkbox" checked={selected} onChange={onToggle}/>
          <button className="starBtn" title={mail.favorite?'Quitar destacado':'Destacar'} onClick={toggleFav}>
            {mail.favorite ? <FaStar/> : <FaRegStar/>}
          </button>

          <div className="mail-info">
            <strong className="mail-sender">{mail.de || 'Remitente desconocido'}</strong>
            <span   className="mail-subject">{mail.asunto || '(Sin asunto)'}</span>
            <span
              className="mail-snippet"
              dangerouslySetInnerHTML={{__html:(mail.contenido||'').slice(0,80)}}
            />
          </div>

          <span className="mail-date">{fmtDate(mail.fecha)}</span>

          {/* hover actions */}
          <div className="hover-actions">
            <button title="Eliminar"          onClick={delMail}><FaTrash/></button>
            {currentFolder==='trash' ? (
              <button title="Restaurar"       onClick={restore}><FaUndoAlt/></button>
            ) : currentFolder!=='spam' ? (
              <button title="Marcar como spam"onClick={spam}><FaExclamationCircle/></button>
            ) : (
              <button title="Sacar de spam"   onClick={noSpam}><FaUndoAlt/></button>
            )}
            <button title="Archivar"><FaArchive/></button>
            <button
              title={mail.is_read?'Marcar como no leído':'Marcar como leído'}
              className="unread-icon"
              onClick={toggleRead}
            >
              <FaEnvelope/>{mail.is_read && <span className="dot"/>}
            </button>
          </div>
        </div>

        {/* ── adjuntos preview ── */}
        {Array.isArray(mail.adjuntos) && mail.adjuntos.length>0 && (
          <div className="mail-attachment-row">
            {mail.adjuntos.slice(0,4).map((att,idx)=>(
              <button          /* ahora es botón, no enlace */
                key={idx}
                className="attachment-pill"
                title={att.nombre}
                onClick={e=>{ e.stopPropagation(); setPreviewAtt(att);} }
              >
                {attIcon(att.nombre)}
                <span className="filename">{att.nombre}</span>
              </button>
            ))}
            {mail.adjuntos.length>4 && (
              <span className="more-attachments">
                +{mail.adjuntos.length-4} más
              </span>
            )}
          </div>
        )}
      </div>

      {/* ───────── modal PREVIEW ───────── */}
      {previewAtt && (
        <div className="att-modal" onClick={()=>setPreviewAtt(null)}>
          <div className="att-dialog" onClick={e=>e.stopPropagation()}>
            <button className="close-btn" onClick={()=>setPreviewAtt(null)}>
              <FaTimes/>
            </button>

            <div className="att-header">
              {attIcon(previewAtt.nombre)}
              <span className="name">{previewAtt.nombre}</span>
              <a
                href={previewAtt.url}
                download={previewAtt.nombre}
                className="download-btn"
                title="Descargar"
              >
                <FaDownload/> Descargar
              </a>
            </div>

            <div className="att-body">
              {/* imágenes */}
              {previewAtt.mimetype?.startsWith('image/')
                ? <img src={previewAtt.preview} alt={previewAtt.nombre}/>
              /* PDF & otros abribles */
                : previewAtt.mimetype==='application/pdf'
                  ? <iframe title="preview" src={`${previewAtt.preview}#zoom=page-fit`} />
              /* fallback */
                  : <p>No se puede previsualizar este tipo de archivo.</p>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}