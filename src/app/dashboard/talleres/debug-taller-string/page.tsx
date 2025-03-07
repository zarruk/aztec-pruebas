'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugTallerStringPage() {
  const [nombre, setNombre] = useState('Taller de prueba');
  const [descripcion, setDescripcion] = useState('Descripción de prueba');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('18:00');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    addLog('Iniciando creación de taller en vivo con fecha como string...');
    
    try {
      if (!nombre || !descripcion) {
        throw new Error('Nombre y descripción son obligatorios');
      }
      
      if (!fecha) {
        throw new Error('La fecha es obligatoria para talleres en vivo');
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addLog(`URL: ${supabaseUrl}`);
      addLog(`Key exists: ${!!supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Formatear la fecha y hora
      const fechaCompleta = new Date(`${fecha}T${hora}`);
      const fechaISO = fechaCompleta.toISOString();
      
      addLog(`Fecha formateada: ${fechaISO}`);
      
      // Datos para un taller en vivo con fecha como string
      const tallerData = {
        nombre,
        descripcion,
        tipo: 'vivo',
        fecha_vivo: fechaISO, // Como string, no como array
        video_url: 'https://example.com/video',
        capacidad: 20,
        precio: 99000,
        herramientas: [],
        campos_webhook: {}
      };
      
      addLog(`Enviando datos: ${JSON.stringify(tallerData)}`);
      
      // Verificar la estructura de la tabla
      const { data: tableInfo, error: tableError } = await supabase
        .from('talleres')
        .select('*')
        .limit(1);
      
      if (tableError) {
        addLog(`ERROR al verificar tabla: ${tableError.message}`);
      } else {
        addLog(`Estructura de la tabla: ${JSON.stringify(tableInfo)}`);
      }
      
      const { data, error: supabaseError } = await supabase
        .from('talleres')
        .insert(tallerData)
        .select();
      
      if (supabaseError) {
        addLog(`ERROR de Supabase: ${supabaseError.message}`);
        throw supabaseError;
      }
      
      addLog(`Taller creado exitosamente: ${JSON.stringify(data)}`);
      setSuccess('Taller creado correctamente');
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      addLog(`ERROR: ${errorMessage}`);
      console.error('Error completo:', err);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Depuración de Creación de Taller en Vivo (Fecha como String)</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Formulario de Taller en Vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-1">Nombre</label>
                <Input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Nombre del taller"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Descripción</label>
                <Textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Descripción del taller"
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Fecha</label>
                <Input
                  type="date"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block mb-1">Hora</label>
                <Input
                  type="time"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creando...' : 'Crear Taller en Vivo'}
              </Button>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {success}
                </div>
              )}
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded h-[400px] overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-gray-500">No hay logs disponibles</p>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="mb-1 font-mono text-sm">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 