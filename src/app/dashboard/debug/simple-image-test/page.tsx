"use client";

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function SimpleImageTestPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const addLog = (message: string) => {
    setLogs(prev => [...prev, message]);
  };

  const handleUpload = async () => {
    // ... código existente ...
    
    try {
      // ... código existente ...
      
      // Subir archivo y obtener URL pública
      // ... código existente ...
      
      // Probar inserción en la tabla talleres con ID seguro
      if (uploadedUrl) {
        addLog("Probando inserción en tabla talleres...");
        
        // Generar un ID seguro (máximo 7 dígitos)
        const safeId = Date.now() % 10000000;
        addLog(`Usando ID seguro: ${safeId}`);
        
        try {
          const { data: tallerData, error: tallerError } = await supabase
            .from('talleres')
            .insert({
              id: safeId,
              nombre: `Test imagen ${new Date().toLocaleTimeString()}`,
              descripcion: "Prueba de imagen",
              tipo: "vivo",
              imagen_url: uploadedUrl,
              precio: 99000,
              capacidad: 20,
              video_url: "https://example.com/video",
            })
            .select();
          
          if (tallerError) {
            throw tallerError;
          }
          
          addLog(`Taller creado exitosamente con ID: ${tallerData[0].id}`);
          
          // Verificar que la URL se guardó correctamente
          const { data: verificacion, error: verificacionError } = await supabase
            .from('talleres')
            .select('imagen_url, video_url')
            .eq('id', tallerData[0].id)
            .single();
          
          if (verificacionError) {
            throw verificacionError;
          }
          
          addLog(`URL de imagen guardada en DB: ${verificacion.imagen_url}`);
          addLog(`URL de video guardada en DB: ${verificacion.video_url}`);
          
          if (verificacion.imagen_url === uploadedUrl) {
            addLog("✅ La URL de imagen se guardó correctamente");
          } else {
            addLog("❌ La URL de imagen guardada no coincide con la URL original");
          }
        } catch (dbError: any) {
          addLog(`ERROR en DB: ${dbError.message}`);
        }
      }
      
    } catch (error: any) {
      addLog(`Error: ${error.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba Simple de Imágenes</h1>
      
      <div className="mb-4">
        <button 
          onClick={handleUpload}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Subir Imagen de Prueba
        </button>
      </div>
      
      {uploadedUrl && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Imagen Subida:</h2>
          <img src={uploadedUrl} alt="Imagen subida" className="max-w-md border" />
        </div>
      )}
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">Logs:</h2>
        <div className="bg-gray-100 p-4 rounded">
          {logs.length === 0 ? (
            <p className="text-gray-500">No hay logs aún...</p>
          ) : (
            <ul className="list-disc pl-5">
              {logs.map((log, index) => (
                <li key={index}>{log}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 