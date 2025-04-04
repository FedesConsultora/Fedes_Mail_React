// src/pages/EmailDetail.js
import React from 'react';
import { useParams } from 'react-router-dom';

export default function EmailDetail() {
  const { id } = useParams();
  return <h2>📧 Detalle del Email #{id}</h2>;
}
