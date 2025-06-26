// src/utils/textToHtml.js

export function textToHtml(txt) {
  if (!txt) return '';

  // Escapar caracteres HTML peligrosos
  const escapeHtml = str =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;');

  const paragraphs = txt.split(/\n{2,}/);

  const parsed = paragraphs.map(paragraph => {
    let safe = escapeHtml(paragraph);

    // Detectar emails
    safe = safe.replace(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
      `<a href="mailto:$1" target="_blank" rel="noopener noreferrer">$1</a>`
    );

    // Detectar URLs
    safe = safe.replace(
      /((https?:\/\/|www\.)[^\s<]+)/g,
      url => {
        const cleanUrl = url.replace(/[.,;:!?)]*$/, '');
        const href = cleanUrl.startsWith('http') ? cleanUrl : `https://${cleanUrl}`;
        return `<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>`;
      }
    );

    // Saltos simples a <br/>
    return `<p>${safe.replace(/\n/g, '<br/>')}</p>`;
  });

  return parsed.join('');
}
