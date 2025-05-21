// src/components/NoMails.jsx

export default function NoMails({ mensaje = 'No hay correos en esta carpeta.' }) {
  return (
    <div className="no-mails">
      {mensaje}
    </div>
  );
}
