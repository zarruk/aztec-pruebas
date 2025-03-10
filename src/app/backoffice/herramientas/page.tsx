'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Herramienta } from '@/lib/types';

export default function HerramientasPage() {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchHerramientas = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('herramientas')
          .select('*')
          .order('nombre');

        if (error) {
          throw error;
        }

        setHerramientas(data || []);
      } catch (err: any) {
        console.error('Error al cargar herramientas:', err);
        setError(err.message || 'Error al cargar las herramientas');
      } finally {
        setLoading(false);
      }
    };

    fetchHerramientas();
  }, [supabase]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta herramienta?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('herramientas')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Actualizar la lista de herramientas
      setHerramientas(herramientas.filter(h => h.id !== id));
    } catch (err: any) {
      console.error('Error al eliminar herramienta:', err);
      alert(`Error al eliminar: ${err.message}`);
    }
  };

  return (
    <div className="bg-white text-gray-800 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Herramientas</h1>
        <Link 
          href="/backoffice/herramientas/nueva" 
          className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Herramienta
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-emerald-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Cargando herramientas...</p>
        </div>
      ) : (
        <>
          {herramientas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-4">No hay herramientas disponibles.</p>
              <Link 
                href="/backoffice/herramientas/nueva" 
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded inline-flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Crear primera herramienta
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Imagen</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {herramientas.map((herramienta) => (
                    <tr key={herramienta.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{herramienta.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                          {herramienta.imagen_url ? (
                            <img 
                              src={herramienta.imagen_url} 
                              alt={herramienta.nombre}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{herramienta.nombre}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{herramienta.descripcion}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/backoffice/herramientas/${herramienta.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Editar
                        </Link>
                        <button 
                          onClick={() => handleDelete(herramienta.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
} 