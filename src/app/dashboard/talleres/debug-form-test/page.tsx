'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DebugButton } from '../debug-button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function DebugFormTestPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>(null);
  const supabase = createClientComponentClient();
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };
  
  // Función para obtener herramientas
  const fetchHerramientas = async () => {
    try {
      addLog('Obteniendo herramientas...');
      const { data, error } = await supabase
        .from('herramientas')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      addLog(`Se encontraron ${data.length} herramientas`);
      return data;
    } catch (error: any) {
      addLog(`Error al obtener herramientas: ${error.message}`);
      return [];
    }
  };
  
  // Función para obtener datos del formulario desde localStorage
  const loadFormData = () => {
    try {
      const data = localStorage.getItem('taller_form_data');
      if (data) {
        const parsedData = JSON.parse(data);
        setFormData(parsedData);
        addLog('Datos del formulario cargados desde localStorage');
        
        // Mostrar información de tipos
        addLog(`Tipo de fecha_vivo: ${typeof parsedData.fecha_vivo}, es array: ${Array.isArray(parsedData.fecha_vivo)}`);
        addLog(`Tipo de fecha_live_build: ${typeof parsedData.fecha_live_build}, es array: ${Array.isArray(parsedData.fecha_live_build)}`);
        addLog(`Tipo de campos_webhook: ${typeof parsedData.campos_webhook}, es array: ${Array.isArray(parsedData.campos_webhook)}`);
      } else {
        addLog('No hay datos del formulario en localStorage');
      }
    } catch (error: any) {
      addLog(`Error al cargar datos: ${error.message}`);
    }
  };
  
  // Cargar datos al iniciar
  useEffect(() => {
    addLog('Página de depuración iniciada');
    loadFormData();
    
    // Verificar estructura de la tabla talleres
    const checkTableStructure = async () => {
      try {
        addLog('Verificando estructura de la tabla talleres...');
        const { data, error } = await supabase
          .from('talleres')
          .select('fecha_vivo, fecha_live_build, campos_webhook')
          .limit(1);
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const sample = data[0];
          addLog(`Muestra de la tabla: ${JSON.stringify(sample)}`);
          addLog(`Tipo de fecha_vivo en DB: ${typeof sample.fecha_vivo}, es array: ${Array.isArray(sample.fecha_vivo)}`);
          addLog(`Tipo de fecha_live_build en DB: ${typeof sample.fecha_live_build}, es array: ${Array.isArray(sample.fecha_live_build)}`);
          addLog(`Tipo de campos_webhook en DB: ${typeof sample.campos_webhook}, es array: ${Array.isArray(sample.campos_webhook)}`);
        } else {
          addLog('No se encontraron registros en la tabla talleres');
        }
      } catch (error: any) {
        addLog(`Error al verificar estructura: ${error.message}`);
      }
    };
    
    checkTableStructure();
  }, []);
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Depuración de Formulario de Talleres</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Acciones</h2>
          
          <div className="space-y-4">
            <button
              onClick={loadFormData}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full"
            >
              Cargar datos del formulario
            </button>
            
            <button
              onClick={() => {
                localStorage.removeItem('taller_form_data');
                setFormData(null);
                addLog('Datos del formulario eliminados de localStorage');
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md w-full"
            >
              Limpiar datos guardados
            </button>
            
            <button
              onClick={() => router.push('/dashboard/talleres/nuevo')}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md w-full"
            >
              Ir al formulario de nuevo taller
            </button>
            
            <DebugButton 
              onDebug={() => addLog('Botón de depuración presionado')} 
            />
          </div>
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Logs</h2>
          <div className="bg-gray-100 p-3 rounded-md h-80 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm mb-1 font-mono">
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {formData && (
        <div className="mt-6 border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Datos del formulario</h2>
          <pre className="bg-gray-100 p-3 rounded-md overflow-auto max-h-80 text-sm">
            {JSON.stringify(formData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 