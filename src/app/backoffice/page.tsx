'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function BackofficePage() {
  const router = useRouter();
  
  const handleLogout = () => {
    // Eliminar la cookie de autenticación
    document.cookie = 'backoffice_auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    // Redirigir al login
    router.push('/backoffice/login');
  };
  
  return (
    <div className="bg-white text-gray-800 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Panel de Administración Backoffice</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Cerrar Sesión
        </button>
      </div>
      
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
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Herramientas</h2>
          <p className="text-gray-600 mb-4">Gestiona las herramientas utilizadas en los talleres.</p>
          <a 
            href="/backoffice/herramientas" 
            className="inline-block bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded"
          >
            Administrar herramientas
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
    </div>
  );
} 