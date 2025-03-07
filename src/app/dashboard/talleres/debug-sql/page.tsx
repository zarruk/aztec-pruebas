'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DebugSQLPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  const checkTableStructure = async () => {
    setIsLoading(true);
    addLog('Verificando estructura de la tabla talleres...');
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Consulta SQL para obtener la estructura de la tabla
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'talleres' });
      
      if (tableError) {
        addLog(`ERROR al obtener estructura de tabla: ${tableError.message}`);
        
        // Intentar con una consulta SQL directa
        addLog('Intentando con SQL directo...');
        
        const { data: sqlData, error: sqlError } = await supabase
          .from('talleres')
          .select('*')
          .limit(1);
        
        if (sqlError) {
          addLog(`ERROR con SQL directo: ${sqlError.message}`);
        } else {
          addLog(`Datos de muestra: ${JSON.stringify(sqlData)}`);
          
          if (sqlData && sqlData.length > 0) {
            const sample = sqlData[0];
            addLog(`Campos disponibles: ${Object.keys(sample).join(', ')}`);
            
            // Verificar el tipo de fecha_vivo
            addLog(`Tipo de fecha_vivo: ${typeof sample.fecha_vivo}`);
            addLog(`¿Es array fecha_vivo?: ${Array.isArray(sample.fecha_vivo)}`);
            addLog(`Valor de fecha_vivo: ${JSON.stringify(sample.fecha_vivo)}`);
          }
        }
      } else {
        addLog(`Estructura de tabla: ${JSON.stringify(tableInfo)}`);
      }
      
      // Intentar crear un taller con fecha_vivo como array
      addLog('Intentando crear un taller con fecha_vivo como array...');
      
      const testDate = new Date().toISOString();
      const { data: insertData, error: insertError } = await supabase
        .from('talleres')
        .insert({
          nombre: 'Test SQL',
          descripcion: 'Test con SQL directo',
          tipo: 'vivo',
          fecha_vivo: [testDate], // Como array
          video_url: 'https://example.com/video',
          capacidad: 20,
          precio: 99000,
          herramientas: [],
          campos_webhook: {}
        })
        .select();
      
      if (insertError) {
        addLog(`ERROR al insertar: ${insertError.message}`);
        
        // Intentar con SQL directo
        addLog('Intentando insertar con SQL directo...');
        
        const { data: sqlInsertData, error: sqlInsertError } = await supabase
          .rpc('insert_taller_with_array', {
            p_nombre: 'Test SQL RPC',
            p_descripcion: 'Test con SQL RPC',
            p_tipo: 'vivo',
            p_fecha_vivo: `{${testDate}}`, // Formato de array PostgreSQL
            p_video_url: 'https://example.com/video',
            p_capacidad: 20,
            p_precio: 99000
          });
        
        if (sqlInsertError) {
          addLog(`ERROR con SQL RPC: ${sqlInsertError.message}`);
        } else {
          addLog(`Inserción con SQL RPC exitosa: ${JSON.stringify(sqlInsertData)}`);
        }
      } else {
        addLog(`Inserción exitosa: ${JSON.stringify(insertData)}`);
      }
    } catch (error: any) {
      addLog(`ERROR: ${error.message || 'Error desconocido'}`);
      console.error('Error completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testArrayFormat = async () => {
    setIsLoading(true);
    addLog('Probando diferentes formatos de array para fecha_vivo...');
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Faltan variables de entorno de Supabase');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      const testDate = new Date().toISOString();
      
      // Obtener el ID máximo actual
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
      
      // Crear taller sin fecha_vivo
      addLog(`Creando taller con ID ${nextId} sin fecha_vivo...`);
      
      const { data: tallerData, error: tallerError } = await supabase
        .from('talleres')
        .insert({
          id: nextId,
          nombre: 'Test Array Format',
          descripcion: 'Test de formato de array',
          tipo: 'vivo',
          video_url: 'https://example.com/video',
          capacidad: 20,
          precio: 99000,
          herramientas: [],
          campos_webhook: {},
          fecha_vivo: null
        })
        .select();
      
      if (tallerError) {
        addLog(`ERROR al crear taller: ${tallerError.message}`);
        return;
      }
      
      addLog(`Taller creado: ${JSON.stringify(tallerData)}`);
      
      // Probar diferentes formatos de array
      const formatos = [
        { nombre: 'Array de un elemento', valor: [testDate] },
        { nombre: 'Array vacío', valor: [] },
        { nombre: 'Array de strings', valor: [testDate, new Date(Date.now() + 86400000).toISOString()] }
      ];
      
      for (const formato of formatos) {
        addLog(`Probando formato: ${formato.nombre}`);
        addLog(`Valor: ${JSON.stringify(formato.valor)}`);
        
        const { error: updateError } = await supabase
          .from('talleres')
          .update({ fecha_vivo: formato.valor })
          .eq('id', nextId);
        
        if (updateError) {
          addLog(`ERROR con formato ${formato.nombre}: ${updateError.message}`);
        } else {
          addLog(`Actualización exitosa con formato ${formato.nombre}`);
          
          // Verificar el resultado
          const { data: checkData, error: checkError } = await supabase
            .from('talleres')
            .select('fecha_vivo')
            .eq('id', nextId)
            .single();
          
          if (checkError) {
            addLog(`ERROR al verificar: ${checkError.message}`);
          } else {
            addLog(`Resultado: ${JSON.stringify(checkData)}`);
            addLog(`Tipo: ${typeof checkData.fecha_vivo}`);
            addLog(`¿Es array?: ${Array.isArray(checkData.fecha_vivo)}`);
          }
        }
      }
    } catch (error: any) {
      addLog(`ERROR: ${error.message || 'Error desconocido'}`);
      console.error('Error completo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Depuración SQL para Talleres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={checkTableStructure} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Verificando...' : 'Verificar Estructura de Tabla'}
            </Button>
            
            <Button 
              onClick={testArrayFormat} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Probando...' : 'Probar Formatos de Array'}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded h-[500px] overflow-y-auto">
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