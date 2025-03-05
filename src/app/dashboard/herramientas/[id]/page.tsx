'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HerramientaForm } from '@/components/dashboard/herramienta-form';
import { supabase } from '@/lib/supabase-browser';
import { Herramienta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function EditarHerramientaPage() {
  const params = useParams();
  const id = typeof params.id === 'string' ? parseInt(params.id) : null;
  
  const [herramienta, setHerramienta] = useState<Herramienta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHerramienta = async () => {
      if (!id) {
        setError('ID de herramienta no válido');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('herramientas')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Herramienta no encontrada');
        
        setHerramienta(data);
      } catch (err) {
        console.error('Error al cargar la herramienta:', err);
        setError('Error al cargar la herramienta. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchHerramienta();
  }, [id]);

  useEffect(() => {
    console.log('TallerForm recibió tallerId:', id);
    console.log('Tipo de tallerId:', typeof id);
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-slate-200 rounded mb-2"></div>
          <div className="h-3 w-32 bg-slate-100 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !herramienta) {
    return (
      <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="text-red-500 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-800 mb-2">{error || 'Herramienta no encontrada'}</h3>
        <Link href="/dashboard/herramientas">
          <Button 
            variant="outline" 
            className="mt-4"
          >
            Volver a herramientas
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Editar herramienta</h1>
        <p className="text-slate-600">Actualiza la información de la herramienta</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <HerramientaForm herramienta={herramienta} />
      </div>
    </div>
  );
} 