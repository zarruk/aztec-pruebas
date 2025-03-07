'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugTallerFixedPage() {
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
    addLog('Iniciando creación de taller en vivo (versión corregida)...');
    
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
      
      // Obtener el ID máximo actual para asignar un nuevo ID
      addLog('Obteniendo ID máximo actual...');
      const { data: maxIdData, error: maxIdError } = await supabase
        .from('talleres')
        .select('id')
        .order('id', { ascending: false })
        .limit(1);
      
      if (maxIdError) {
        addLog(`ERROR al obtener ID máximo: ${maxIdError.message}`);
        throw maxIdError;
      }
      
      // Calcular el siguiente ID
      let nextId = 1;
      if (maxIdData && maxIdData.length > 0) {
        nextId = maxIdData[0].id + 1;
      }
      
      addLog(`Próximo ID a usar: ${nextId}`);
      
      // Formatear la fecha y hora
      const fechaCompleta = new Date(`${fecha}T${hora}`);
      const fechaISO = fechaCompleta.toISOString();
      
      addLog(`Fecha formateada: ${fechaISO}`);
      
      // Datos para un taller en vivo con ID explícito y fecha_vivo como null
      // Luego actualizaremos fecha_vivo en un segundo paso
      const tallerData = {
        id: nextId,
        nombre,
        descripcion,
        tipo: 'vivo',
        video_url: 'https://example.com/video',
        capacidad: 20,
        precio: 99000,
        herramientas: [],
        campos_webhook: {},
        fecha_vivo: null // Inicialmente null
      };
      
      addLog(`Enviando datos iniciales: ${JSON.stringify(tallerData)}`);
      
      // Paso 1: Insertar el taller con fecha_vivo como null
      const { data: tallerCreado, error: insertError } = await supabase
        .from('talleres')
        .insert(tallerData)
        .select();
      
      if (insertError) {
        addLog(`ERROR al insertar taller: ${insertError.message}`);
        throw insertError;
      }
      
      addLog(`Taller creado exitosamente: ${JSON.stringify(tallerCreado)}`);
      
      // Paso 2: Actualizar el taller con fecha_vivo como array
      addLog('Actualizando fecha_vivo como array...');
      
      const { error: updateError } = await supabase
        .from("talleres")
        .update({ fecha_vivo: [fechaISO] }) // Enviar como array
        .eq("id", nextId);
      
      if (updateError) {
        addLog(`ERROR al actualizar fecha_vivo: ${updateError.message}`);
        throw updateError;
      }
      
      addLog('Fecha actualizada correctamente');
      
      // Verificar el taller actualizado
      const { data: tallerFinal, error: selectError } = await supabase
        .from('talleres')
        .select('*')
        .eq('id', nextId)
        .single();
      
      if (selectError) {
        addLog(`ERROR al verificar taller final: ${selectError.message}`);
      } else {
        addLog(`Taller final: ${JSON.stringify(tallerFinal)}`);
        
        // Mostrar información detallada sobre fecha_vivo
        addLog(`Tipo de fecha_vivo: ${typeof tallerFinal.fecha_vivo}`);
        addLog(`¿Es array fecha_vivo?: ${Array.isArray(tallerFinal.fecha_vivo)}`);
        addLog(`Valor de fecha_vivo: ${JSON.stringify(tallerFinal.fecha_vivo)}`);
        
        // Verificar la estructura de la tabla
        const { data: tableInfo, error: tableError } = await supabase
          .from('talleres')
          .select('fecha_vivo')
          .limit(1);
        
        if (tableError) {
          addLog(`ERROR al verificar estructura de tabla: ${tableError.message}`);
        } else if (tableInfo && tableInfo.length > 0) {
          addLog(`Estructura de fecha_vivo en la tabla: ${JSON.stringify({
            value: tableInfo[0].fecha_vivo,
            type: typeof tableInfo[0].fecha_vivo,
            isArray: Array.isArray(tableInfo[0].fecha_vivo)
          })}`);
        }
      }
      
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
      <h1 className="text-2xl font-bold mb-6">Depuración de Creación de Taller en Vivo (Versión Corregida)</h1>
      
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