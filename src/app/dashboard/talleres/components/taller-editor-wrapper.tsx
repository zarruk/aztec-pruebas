'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TallerForm } from '@/app/dashboard/talleres/components/taller-form';
import { supabase } from '@/lib/supabase';
import { Taller } from '@/lib/types';

interface TallerEditorWrapperProps {
  id: string;
}

export function TallerEditorWrapper({ id }: TallerEditorWrapperProps) {
  const router = useRouter();
  const [taller, setTaller] = useState<Taller | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTaller = async () => {
      try {
        setLoading(true);
        
        console.log(`Obteniendo taller con ID: ${id}`);
        
        const { data, error } = await supabase
          .from('talleres')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error("Error al obtener taller:", error);
          throw error;
        }
        
        if (!data) {
          throw new Error('Taller no encontrado');
        }
        
        console.log("Taller obtenido:", data);
        setTaller(data);
      } catch (err: any) {
        console.error('Error al cargar el taller:', err);
        setError(err.message || 'Error al cargar el taller');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaller();
  }, [id]);

  if (loading) {
    return <div className="p-6">Cargando taller...</div>;
  }

  if (error || !taller) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error || 'No se pudo cargar el taller'}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Editar Taller</h1>
      <TallerForm taller={taller} />
    </div>
  );
} 