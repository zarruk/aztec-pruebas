'use client';

import React from 'react';
import { TallerForm } from '@/components/dashboard/taller-form';

export default function BackofficeNuevoTallerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Crear nuevo taller</h1>
        <p className="text-slate-700 mt-2">Completa el formulario para crear un nuevo taller</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <TallerForm />
      </div>
    </div>
  );
} 