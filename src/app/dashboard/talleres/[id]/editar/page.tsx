'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { TallerForm } from '@/components/dashboard/taller-form';

export default function EditarTallerPage() {
  const params = useParams();
  const tallerId = params.id as string;
  const supabase = createClientComponentClient<Database>();
  
  const [taller, setTaller] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  console.log("EditarTallerPage - ID del taller recibido:", params.id);
  console.log("EditarTallerPage - Tipo de ID:", typeof params.id);
  
  useEffect(() => {
    const fetchTaller = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('talleres')
          .select('*')
          .eq('id', tallerId)
          .single();
        
        if (error) {
          throw error;
        }
        
        setTaller(data as unknown);
      } catch (error: any) {
        console.error('Error al cargar el taller:', error);
        setError('No se pudo cargar la información del taller. Por favor, inténtalo de nuevo.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTaller();
  }, [tallerId, supabase]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
        <h2 className="text-lg font-medium text-red-800 mb-2">Error</h2>
        <p className="text-red-700">{error}</p>
        <a 
          href="/dashboard/talleres" 
          className="mt-4 inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors"
        >
          Volver a talleres
        </a>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar taller</h1>
        <p className="text-slate-700 mt-2">Modifica la información del taller</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        {taller ? <TallerForm taller={taller} /> : (
          <div className="text-center text-slate-700 py-8">
            No se encontró el taller solicitado
          </div>
        )}
      </div>
    </div>
  );
} 