export default function FirmaForm({ data, onChange, onSave, mensaje, regenerarFirma, cargandoFirma }) {
  return (
    <div className="firma-form">
      <div className="form-group">
        <label>Nombre completo</label>
        <input type="text" name="nombre_completo" value={data.nombre_completo} onChange={onChange} />
      </div>

      <div className="form-group">
        <label>Puesto</label>
        <input type="text" name="puesto" value={data.puesto} onChange={onChange} />
      </div>

      <div className="form-group">
        <label>Equipo de trabajo</label>
        <input type="text" name="equipo_trabajo" value={data.equipo_trabajo} onChange={onChange} />
      </div>

      <div className="form-group">
        <label>Teléfono personal</label>
        <input type="text" name="telefono_personal" value={data.telefono_personal} onChange={onChange} />
      </div>

      <div className="btn-group">
        <button className="guardar-btn" onClick={onSave}>💾 Guardar cambios</button>
        <button className="regenerar-btn" onClick={regenerarFirma} disabled={cargandoFirma}>
          🔁 Actualizar firma HTML
        </button>
        {cargandoFirma && <span>Generando…</span>}
      </div>

      {mensaje && <p className="mensaje">{mensaje}</p>}

      <div className="firma-preview">
        <p className="preview-label">👀 Vista previa de firma generada:</p>
        <div className="preview-box" dangerouslySetInnerHTML={{ __html: data.firma_html }} />
      </div>
    </div>
  );
}
