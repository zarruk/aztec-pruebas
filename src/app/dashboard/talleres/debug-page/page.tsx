'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';

export default function DebugPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  const testSupabaseConnection = async () => {
    addLog('Probando conexión a Supabase...');
    setIsLoading(true);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addLog(`URL: ${supabaseUrl}`);
      addLog(`Key exists: ${!!supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data, error } = await supabase
        .from('talleres')
        .select('count')
        .limit(1);
      
      if (error) {
        throw error;
      }
      
      addLog(`Conexión exitosa. Resultado: ${JSON.stringify(data)}`);
    } catch (error: any) {
      addLog(`ERROR: ${error.message || 'Error desconocido'}`);
      console.error('Error completo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const createMinimalTaller = async () => {
    addLog('Creando taller mínimo...');
    setIsLoading(true);
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Obtener el ID máximo actual
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
      
      // Datos mínimos para un taller con ID explícito
      const tallerData = {
        id: nextId,
        nombre: `Taller de prueba ${Date.now()}`,
        descripcion: 'Descripción de prueba',
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
    } catch (error: any) {
      addLog(`ERROR: ${error.message || 'Error desconocido'}`);
      console.error('Error completo:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Página de debugging</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Acciones</h2>
          
          <div className="space-y-2">
            <Button 
              onClick={testSupabaseConnection}
              disabled={isLoading}
              className="w-full"
            >
              Probar conexión a Supabase
            </Button>
            
            <Button 
              onClick={createMinimalTaller}
              disabled={isLoading}
              className="w-full"
            >
              Crear taller mínimo
            </Button>
            
            <Button 
              onClick={() => setLogs([])}
              variant="outline"
              className="w-full"
            >
              Limpiar logs
            </Button>
          </div>
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Variables de entorno</h3>
            <div className="bg-gray-100 p-3 rounded-md text-sm">
              <p>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'No definido'}</p>
              <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '***' : 'No definido'}</p>
            </div>
          </div>
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
        </div>
      </div>
    </div>
  );
} 