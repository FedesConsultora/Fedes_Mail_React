import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

/* ─────────────── utilidades ─────────────── */
const EMAIL_RE = /^[\w.!#$%&’*+/=?^`{|}~-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;

const DOMAIN_TYPO_MAP = {
  gamil  : 'gmail.com',
  gnail  : 'gmail.com',
  hotmial: 'hotmail.com',
  hotmil : 'hotmail.com',
  yahooo : 'yahoo.com',
  outlok : 'outlook.com',
  icloud : 'icloud.com',
};

const isValid = (e) => EMAIL_RE.test(e.trim());

const typoFix = (email) => {
  const [, dom = ''] = email.split('@');
  const key   = dom.toLowerCase().replace(/\..*/, '');         // "gamil.com"→"gamil"
  const fixed = DOMAIN_TYPO_MAP[key];
  return fixed ? email.replace(dom, fixed) : null;
};
/* ─────────────────────────────────────────── */

export default function MultiEmailInput({
  initialEmails = [],
  placeholder   = 'Para',
  suggestions   = [],          // [{label, email}]
  onChange,                     // (array<string>) => void
}) {
  /* ── estado ────────────────────────────────────────────── */
  const [emails, setEmails]   = useState(initialEmails);
  const [value,  setValue]    = useState('');
  const [typo,   setTypo]     = useState(null);        // {original,fixed}
  const [list,   setList]     = useState([]);          // sugerencias filtradas
  const [hi,     setHi]       = useState(0);           // highlight index
  const inputRef = useRef();

  /* avisar al padre cada vez que cambie el array */
  useEffect(()=>{ onChange?.(emails); }, [emails, onChange]);

  /* filtrar sugerencias cuando cambie `value` o `suggestions` */
  useEffect(() => {
    const v = value.trim().toLowerCase();
    if (!v) { setList([]); return; }

    const filtradas = suggestions
      .filter(s =>
        (s.email.toLowerCase().includes(v) ||
         (s.label || '').toLowerCase().includes(v)) &&
        !emails.includes(s.email)
      )
      .slice(0, 8);          // máx 8 para no ser interminable

    setList(filtradas);
    setHi(0);
  }, [value, suggestions, emails]);

  /* ── helpers ────────────────────────────────────────────── */
  const focus = () => inputRef.current?.focus();

  const add = useCallback((raw) => {
    const e = raw.trim();
    if (!e) return;

    const fix = typoFix(e);
    if (fix) { setTypo({original:e, fixed:fix}); return; }

    if (!emails.includes(e)) { setEmails([...emails, e]); }
    setValue('');
  }, [emails]);

  const confirmTypo = (useFixed) => {
    if (!typo) return;
    add(useFixed ? typo.fixed : typo.original);
    setTypo(null);
  };

  const acceptSuggestion = (idx) => {
    const s = list[idx];
    if (s) add(s.email);
    setList([]);
  };

  /* ── eventos ────────────────────────────────────────────── */
  const onKeyDown = (e) => {
    if (['Enter', 'Tab', ','].includes(e.key)) {
      if (list.length) {
        e.preventDefault();
        acceptSuggestion(hi);
      } else {
        e.preventDefault();
        add(value);
      }
    } else if (e.key === 'ArrowDown' && list.length) {
      e.preventDefault();
      setHi((hi+1) % list.length);
    } else if (e.key === 'ArrowUp' && list.length) {
      e.preventDefault();
      setHi((hi-1+list.length) % list.length);
    } else if (e.key === 'Backspace' && !value && emails.length) {
      setEmails(emails.slice(0, -1));
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    e.clipboardData
      .getData('text')
      .split(/[,;\s]+/)
      .filter(Boolean)
      .forEach(add);
  };

  /* ── acciones chip ──────────────────────────────────────── */
  const remove = (mail) => setEmails(emails.filter((m)=>m!==mail));

  const edit   = (mail) => {
    remove(mail);
    setValue(mail);
    focus();
  };

  /* ── render ─────────────────────────────────────────────── */
  return (
    <div className="chips-container" onClick={focus}>
      {/* chips */}
      {emails.map((m)=>(
        <span
          key={m}
          className={`chip ${isValid(m)?'':'invalid'}`}
          title={isValid(m)?m:'Dirección inválida'}
          onDoubleClick={()=>edit(m)}
        >
          <span className="chip-label">{m}</span>
          <button className="chip-remove" onClick={()=>remove(m)}>
            <FaTimes/>
          </button>
        </span>
      ))}

      {/* input */}
      <input
        ref={inputRef}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        placeholder={placeholder}
      />

      {/* dropdown sugerencias */}
      {!!list.length && (
        <ul className="autocomplete-list">
          {list.map((s,i)=>(
            <li
              key={s.email}
              className={i===hi ? 'active' : ''}
              onMouseEnter={()=>setHi(i)}
              onMouseDown={(e)=>{e.preventDefault(); acceptSuggestion(i);}}
            >
              <span className="name">{s.label}</span>
              <span className="email">&lt;{s.email}&gt;</span>
            </li>
          ))}
        </ul>
      )}

      {/* pop-up “¿Quisiste decir … ?” */}
      {typo && (
        <div className="email-suggestion">
          <span>¿Quisiste decir&nbsp;</span>
          <button className="link-btn"   onClick={()=>confirmTypo(true)}>
            {typo.fixed}
          </button>
          <span>&nbsp;?</span>
          <button className="link-btn dismiss" onClick={()=>confirmTypo(false)}>
            No
          </button>
        </div>
      )}
    </div>
  );
}
