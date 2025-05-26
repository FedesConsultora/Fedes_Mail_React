import React from 'react';

export default function FirmaForm({ data, onChange, onSave, readonly = false }) {
  return (
    <div className="firma-form">
      <div className="form-group">
        <label>Nombre completo</label>
        <input
          type="text"
          name="nombre_completo"
          value={data.nombre_completo}
          onChange={onChange}
          disabled={true}
        />
      </div>

      <div className="form-group">
        <label>Puesto</label>
        <input
          type="text"
          name="puesto"
          value={data.puesto}
          onChange={onChange}
          disabled={true}
        />
      </div>

      <div className="form-group">
        <label>Equipo de trabajo</label>
        <input
          type="text"
          name="equipo_trabajo"
          value={data.equipo_trabajo}
          onChange={onChange}
          disabled={true}
        />
      </div>

      <div className="form-group">
        <label>Teléfono personal</label>
        <input
          type="text"
          name="telefono_personal"
          value={data.telefono_personal}
          onChange={onChange}
          disabled={true}
        />
      </div>

      <div className="form-group">
        <div className="firma-preview">
            <label>Firma HTML</label>
            <div
                className="firma-render"
                dangerouslySetInnerHTML={{ __html: data.firma_html }}
            />
        </div>
      </div>

      {!readonly && (
        <div className="form-actions">
          <button onClick={onSave} className="btn btn-primary">
            Guardar cambios
          </button>
        </div>
      )}
    </div>
  );
}
