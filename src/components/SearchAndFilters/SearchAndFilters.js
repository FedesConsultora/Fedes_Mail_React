// src/components/SearchAndFilters/SearchAndFilters.jsx
import React, { useState } from 'react';
import { FaSearch, FaSlidersH } from 'react-icons/fa';

export default function SearchAndFilters({ onFilterChange }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const toggleAdvanced = () => setShowAdvanced(prev => !prev);

  return (
    <div className="searchFiltersContainer">
      <div className="searchBar">
        <FaSearch className="icon searchIcon" />
        <input type="text" placeholder="Buscar en el correo electrónico" />
        <FaSlidersH className="icon filterIcon" onClick={toggleAdvanced} />
      </div>

      {showAdvanced && (
        <div className="advancedFilters">
          <input type="text" placeholder="De" />
          <input type="text" placeholder="Para" />
          <input type="text" placeholder="Asunto" />
          <input type="text" placeholder="Contiene las palabras" />
          <input type="text" placeholder="No contiene" />
          <div className="row">
            <select>
              <option>mayor que</option>
              <option>menor que</option>
            </select>
            <input type="number" placeholder="Tamaño" />
            <select>
              <option>MB</option>
              <option>KB</option>
            </select>
          </div>
          <div className="row">
            <select>
              <option>1 día</option>
              <option>7 días</option>
              <option>1 mes</option>
            </select>
            <select>
              <option>Todos</option>
              <option>Recibidos</option>
              <option>Enviados</option>
            </select>
          </div>
          <label className="attachments">
            <input type="checkbox" />
            Contiene archivos adjuntos
          </label>

          <div className="actions">
            <button className="btn">Buscar</button>
          </div>
        </div>
      )}
    </div>
  );
}
