'use client';

import React from 'react';
import { HerramientaForm } from '@/components/dashboard/herramienta-form';

export default function NuevaHerramientaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Crear nueva herramienta</h1>
        <p className="text-slate-600">Completa el formulario para crear una nueva herramienta</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <HerramientaForm />
      </div>
    </div>
  );
} 