'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function DebugFormPage() {
  const router = useRouter();
  const [nombre, setNombre] = useState('Taller de prueba');
  const [descripcion, setDescripcion] = useState('Descripción de prueba');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    addLog('Iniciando creación de taller...');
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addLog(`URL: ${supabaseUrl}`);
      addLog(`Key exists: ${!!supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Primero, obtener el ID máximo actual
      addLog('Obteniendo ID máximo actual...');
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('talleres')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (maxIdError) {
        throw maxIdError;
      }
      
      // Calcular el siguiente ID
      let nextId = 1;
      if (maxIdData && maxIdData.length > 0) {
        nextId = maxIdData[0].id + 1;
      }
      
      addLog(`Próximo ID a usar: ${nextId}`);
      
      // Datos para un taller con ID explícito
      const tallerData = {
        id: nextId, // Asignar ID explícitamente
        nombre,
        descripcion,
        tipo: 'vivo',
        video_url: 'https://example.com/video',
        capacidad: 20,
        precio: 99000
      };
      
      addLog(`Enviando datos: ${JSON.stringify(tallerData)}`);
      
      const { data, error } = await supabase
        .from('talleres')
        .insert(tallerData)
        .select();
      
      if (error) {
        throw error;
      }
      
      addLog(`Taller creado exitosamente: ${JSON.stringify(data)}`);
      alert('Taller creado correctamente');
    } catch (error: any) {
      addLog(`ERROR: ${error.message || 'Error desconocido'}`);
      console.error('Error completo:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Formulario de debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
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
                {isSubmitting ? 'Creando...' : 'Crear taller de prueba'}
              </Button>
            </div>
          </form>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Logs</h2>
          <div className="bg-black text-green-400 p-4 rounded-md h-96 overflow-y-auto font-mono text-sm">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))
            ) : (
              <div className="text-gray-500">No hay logs disponibles</div>
            )}
          </div>
          <Button 
            onClick={() => setLogs([])}
            variant="outline"
            className="mt-2"
          >
            Limpiar logs
          </Button>
        </div>
      </div>
    </div>
  );
} 