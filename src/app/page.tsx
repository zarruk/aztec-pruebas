'use client';

import React from 'react';

export default function HomePage() {
  return (
    <div className="bg-white text-gray-800 p-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Panel de Administración Aztec</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Talleres</h2>
          <p className="text-gray-600 mb-4">Gestiona los talleres disponibles en la plataforma.</p>
          <a 
            href="/dashboard/talleres" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Administrar talleres
          </a>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Usuarios</h2>
          <p className="text-gray-600 mb-4">Administra los usuarios registrados en la plataforma.</p>
          <a 
            href="/dashboard/usuarios" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Administrar usuarios
          </a>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Estadísticas</h2>
          <p className="text-gray-600 mb-4">Visualiza las estadísticas de uso de la plataforma.</p>
          <a 
            href="/dashboard/estadisticas" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Ver estadísticas
          </a>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Herramientas</h2>
          <p className="text-gray-600 mb-4">Accede a las herramientas de la plataforma.</p>
          <a 
            href="/dashboard/herramientas" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Ver herramientas
          </a>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Referidos</h2>
          <p className="text-gray-600 mb-4">Gestiona el sistema de referidos.</p>
          <a 
            href="/dashboard/referidos" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Ver referidos
          </a>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800">
          <strong>Nota:</strong> Esta es una versión simplificada del dashboard que no requiere inicio de sesión.
          Accede directamente a las secciones haciendo clic en los botones correspondientes.
        </p>
      </div>
    </div>
  );
}
