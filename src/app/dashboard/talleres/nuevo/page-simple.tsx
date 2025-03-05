'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NuevoTallerSimplePage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      if (!nombre || !descripcion) {
        throw new Error('Nombre y descripción son obligatorios');
      }
      
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      );
      
      // Datos mínimos para crear un taller
      const tallerData = {
        nombre,
        descripcion,
        tipo: 'vivo',
        video_url: 'https://example.com/video',
        capacidad: 20,
        precio: 99000,
      };
      
      const { data, error: supabaseError } = await supabase
        .from('talleres')
        .insert(tallerData)
        .select();
      
      if (supabaseError) throw supabaseError;
      
      alert('Taller creado correctamente');
      router.push('/dashboard/talleres');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al crear el taller');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Crear taller (formulario simplificado)</h1>
        <p className="text-slate-700 mt-2">Completa los campos básicos para crear un taller</p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del taller *
            </label>
            <Input
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Nombre del taller"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción *
            </label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del taller"
              rows={4}
              required
            />
          </div>
          
          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/dashboard/talleres')}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? 'Creando...' : 'Crear taller'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 