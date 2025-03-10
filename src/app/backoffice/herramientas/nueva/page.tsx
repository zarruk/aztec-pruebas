'use client';

import React from 'react';
import { HerramientaForm } from '@/components/backoffice/herramienta-form';

export default function NuevaHerramientaPage() {
  return (
    <div className="bg-white text-gray-800 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Crear Nueva Herramienta</h1>
        <p className="text-gray-600 mt-2">
          Añade una nueva herramienta que podrá ser utilizada en los talleres.
        </p>
      </div>
      
      <HerramientaForm />
    </div>
  );
} 