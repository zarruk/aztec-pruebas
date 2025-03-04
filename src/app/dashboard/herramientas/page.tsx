'use client';

import React from 'react';
import { HerramientasList } from '@/components/dashboard/herramientas-list';
import { PlusCircle } from 'lucide-react';

export default function HerramientasPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Herramientas</h1>
          <p className="text-slate-700">Gestiona las herramientas disponibles para los talleres</p>
        </div>
        
        {/* Botón de crear con alto contraste */}
        <a 
          href="/dashboard/herramientas/nueva" 
          className="inline-flex items-center justify-center px-5 py-3 bg-primary-600 text-white font-medium text-base rounded-md hover:bg-primary-700 transition-colors shadow-md border-2 border-primary-700"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nueva Herramienta
        </a>
      </div>
      
      <HerramientasList />
      
      {/* Botón adicional al final de la página con alto contraste */}
      <div className="flex justify-center mt-8">
        <a 
          href="/dashboard/herramientas/nueva" 
          className="inline-flex items-center justify-center px-6 py-4 bg-primary-600 text-white font-medium text-lg rounded-md hover:bg-primary-700 transition-colors shadow-md border-2 border-primary-700"
        >
          <PlusCircle className="mr-2 h-6 w-6" />
          Crear Nueva Herramienta
        </a>
      </div>
    </div>
  );
} 