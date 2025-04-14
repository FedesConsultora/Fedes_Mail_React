// src/components/ComposeButton.jsx
import React from 'react';
import { FaPen } from 'react-icons/fa';

export default function ComposeButton({ onClick }) {
  return (
    <button className="compose-btn" onClick={onClick}>
      <FaPen className="compose-icon" />
      <span>Redactar</span>
    </button>
  );
}
