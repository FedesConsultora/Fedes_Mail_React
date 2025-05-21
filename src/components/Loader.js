// src/components/Loader.jsx
export default function Loader({ message = "Cargando…" }) {
  return (
    <div className="fedes-loader-container">
      <div className="fedes-spinner-modern"></div>
      <p className="loader-message">{message}</p>
    </div>
  );
}
