'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugTallerArrayPage() {
  const [nombre, setNombre] = useState('Taller de prueba');
  const [descripcion, setDescripcion] = useState('Descripción de prueba');
  const [fechas, setFechas] = useState([{ fecha: '', hora: '18:00' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const handleFechaChange = (index: number, field: 'fecha' | 'hora', value: string) => {
    const newFechas = [...fechas];
    newFechas[index][field] = value;
    setFechas(newFechas);
  };

  const addFecha = () => {
    setFechas([...fechas, { fecha: '', hora: '18:00' }]);
  };

  const removeFecha = (index: number) => {
    if (fechas.length > 1) {
      setFechas(fechas.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    addLog('Iniciando creación de taller en vivo con array de fechas...');
    
    try {
      if (!nombre || !descripcion) {
        throw new Error('Nombre y descripción son obligatorios');
      }
      
      // Verificar que al menos una fecha esté completa
      const fechasCompletas = fechas.filter(f => f.fecha);
      if (fechasCompletas.length === 0) {
        throw new Error('Al menos una fecha es obligatoria para talleres en vivo');
      }
      
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addLog(`URL: ${supabaseUrl}`);
      addLog(`Key exists: ${!!supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Formatear las fechas como array de ISO strings
      const fechasArray = fechas
        .filter(f => f.fecha) // Solo fechas con valor
        .map(f => {
          const fechaCompleta = new Date(`${f.fecha}T${f.hora}`);
          return fechaCompleta.toISOString();
        });
      
      addLog(`Fechas formateadas: ${JSON.stringify(fechasArray)}`);
      
      // Datos para un taller en vivo con array de fechas
      const tallerData = {
        nombre,
        descripcion,
        tipo: 'vivo',
        fecha_vivo: fechasArray,
        video_url: 'https://example.com/video',
        capacidad: 20,
        precio: 99000,
        herramientas: [],
        campos_webhook: {}
      };
      
      addLog(`Enviando datos: ${JSON.stringify(tallerData)}`);
      
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
      <h1 className="text-2xl font-bold mb-6">Depuración de Creación de Taller en Vivo (Array de Fechas)</h1>
      
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
                <label className="block mb-1">Fechas</label>
                {fechas.map((fecha, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="date"
                      value={fecha.fecha}
                      onChange={(e) => handleFechaChange(index, 'fecha', e.target.value)}
                      required={index === 0}
                      className="flex-1"
                    />
                    <Input
                      type="time"
                      value={fecha.hora}
                      onChange={(e) => handleFechaChange(index, 'hora', e.target.value)}
                      required={index === 0}
                      className="w-24"
                    />
                    {fechas.length > 1 && (
                      <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => removeFecha(index)}
                        className="px-2"
                      >
                        X
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addFecha}
                  className="mt-2"
                >
                  Añadir Fecha
                </Button>
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