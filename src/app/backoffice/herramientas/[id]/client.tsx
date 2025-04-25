'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { HerramientaForm } from '@/components/backoffice/herramienta-form';
import { Herramienta } from '@/lib/types';

interface EditarHerramientaClientProps {
  id: string;
}

export default function EditarHerramientaClient({ id }: EditarHerramientaClientProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [herramienta, setHerramienta] = useState<Herramienta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHerramienta = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('herramientas')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          throw error;
        }

        setHerramienta(data);
      } catch (err: any) {
        console.error('Error al cargar herramienta:', err);
        setError(err.message || 'Error al cargar la herramienta');
      } finally {
        setLoading(false);
      }
    };

    fetchHerramienta();
  }, [supabase, id]);

  if (loading) {
    return (
      <div className="bg-white text-gray-800 p-8">
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-emerald-700 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Cargando herramienta...</p>
        </div>
      </div>
    );
  }

  if (error || !herramienta) {
    return (
      <div className="bg-white text-gray-800 p-8">
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          <p className="font-medium">Error:</p>
          <p>{error || 'No se encontró la herramienta'}</p>
        </div>
        <button
          onClick={() => router.push('/backoffice/herramientas')}
          className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800"
        >
          Volver a Herramientas
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-800 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Editar Herramienta</h1>
        <p className="text-gray-600 mt-2">
          Modifica los detalles de la herramienta "{herramienta.nombre}".
        </p>
      </div>
      
      <HerramientaForm herramienta={herramienta} isEditing={true} />
    </div>
  );
} 