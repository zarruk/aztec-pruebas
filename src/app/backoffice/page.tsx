'use client';

import React from 'react';
import Link from 'next/link';

export default function BackofficePage() {
  return (
    <div className="bg-white text-gray-800 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Panel de Administración Backoffice</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Talleres</h2>
          <p className="text-gray-600 mb-4">Gestiona los talleres disponibles en la plataforma.</p>
          <a 
            href="/backoffice/talleres" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Administrar talleres
          </a>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Crear Nuevo Taller</h2>
          <p className="text-gray-600 mb-4">Crea un nuevo taller para la plataforma.</p>
          <a 
            href="/backoffice/talleres/nuevo" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Crear taller
          </a>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Ver Sitio Público</h2>
          <p className="text-gray-600 mb-4">Visita el sitio público para ver cómo se ven los talleres.</p>
          <a 
            href="/talleres" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Ver talleres
          </a>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <strong>Nota:</strong> Este es el panel de administración backoffice que no requiere inicio de sesión.
          Puedes acceder directamente a todas las funciones de administración de talleres.
        </p>
      </div>
    </div>
  );
} 