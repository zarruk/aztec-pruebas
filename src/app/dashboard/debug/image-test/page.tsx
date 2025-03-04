"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { getNextId } from '@/lib/utils';

export default function ImageTestPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Crear URL para vista previa
      const objectUrl = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectUrl);
      
      addLog(`Archivo seleccionado: ${selectedFile.name} (${selectedFile.size} bytes)`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Por favor selecciona un archivo primero");
      return;
    }

    setIsUploading(true);
    addLog("Iniciando carga de imagen...");

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addLog(`URL: ${supabaseUrl}`);
      addLog(`Key exists: ${!!supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Faltan variables de entorno de Supabase");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Generar nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `debug_${Date.now()}.${fileExt}`;
      const filePath = `talleres/${fileName}`;
      
      addLog(`Subiendo a ruta: ${filePath}`);
      
      // Subir archivo
      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        throw error;
      }
      
      addLog(`Archivo subido: ${JSON.stringify(data)}`);
      
      // Obtener URL pública
      const { data: urlData } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);
      
      const publicUrl = urlData.publicUrl;
      setUploadedUrl(publicUrl);
      
      addLog(`URL pública: ${publicUrl}`);
      toast.success("Imagen subida correctamente");
      
      // Probar inserción en la tabla talleres
      addLog("Probando inserción en tabla talleres...");
      
      // Obtener el siguiente ID disponible
      const nextId = await getNextId(supabase, 'talleres');
      addLog(`Usando ID: ${nextId}`);
      
      // Crear un taller de prueba
      const { data: tallerData, error: tallerError } = await supabase
        .from('talleres')
        .insert([
          {
            id: nextId,
            nombre: `Test imagen ${new Date().toLocaleTimeString()}`,
            descripcion: "Prueba de imagen",
            video_url: "https://example.com/video",
            tipo: "vivo",
            capacidad: 20,
            precio: 99000,
            imagen_url: publicUrl
          }
        ])
        .select();
      
      if (tallerError) {
        throw tallerError;
      }
      
      addLog(`Taller creado: ${JSON.stringify(tallerData)}`);
      
      // Verificar que la URL se guardó correctamente
      const tallerId = tallerData[0].id;
      addLog(`Verificando taller con ID: ${tallerId}`);
      
      const { data: verificacion, error: verificacionError } = await supabase
        .from('talleres')
        .select('imagen_url')
        .eq('id', tallerId)
        .single();
      
      if (verificacionError) {
        throw verificacionError;
      }
      
      addLog(`URL guardada en DB: ${verificacion.imagen_url}`);
      
      if (verificacion.imagen_url === publicUrl) {
        addLog("✅ La URL se guardó correctamente");
      } else {
        addLog("❌ La URL guardada no coincide con la URL original");
      }
      
    } catch (error: any) {
      addLog(`ERROR: ${error.message}`);
      console.error("Error completo:", error);
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!uploadedUrl) {
      alert("Por favor, sube una imagen primero");
      return;
    }
    
    setIsSubmitting(true);
    addLog("Probando inserción en tabla talleres...");
    
    try {
      // Crear cliente de Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Faltan variables de entorno de Supabase");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Obtener el siguiente ID disponible
      const nextId = await getNextId(supabase, 'talleres');
      addLog(`Usando ID: ${nextId}`);
      
      // Crear un taller de prueba
      const { data, error } = await supabase
        .from('talleres')
        .insert([
          {
            id: nextId,
            nombre: `Test imagen ${new Date().toLocaleTimeString()}`,
            descripcion: "Prueba de imagen",
            video_url: "https://example.com/video",
            tipo: "vivo",
            capacidad: 20,
            precio: 99000,
            imagen_url: uploadedUrl
          }
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      addLog(`Taller creado: ${JSON.stringify(data)}`);
      
      // Verificar que la URL se guardó correctamente
      const { data: verificacion, error: errorVerificacion } = await supabase
        .from('talleres')
        .select('imagen_url')
        .eq('id', nextId)
        .single();
      
      if (errorVerificacion) {
        throw errorVerificacion;
      }
      
      addLog(`URL guardada en DB: ${verificacion.imagen_url}`);
      
      if (verificacion.imagen_url === uploadedUrl) {
        addLog("✅ La URL se guardó correctamente");
      } else {
        addLog("❌ La URL guardada no coincide con la original");
      }
      
    } catch (error: any) {
      console.error("Error al crear taller:", error);
      addLog(`Error: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Prueba de Carga de Imágenes</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Subir Imagen</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Seleccionar imagen
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm border border-gray-300 rounded-lg cursor-pointer"
            />
          </div>
          
          {previewUrl && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Vista previa:</p>
              <img 
                src={previewUrl} 
                alt="Vista previa" 
                className="max-h-40 rounded-md" 
              />
            </div>
          )}
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:bg-gray-400"
          >
            {isUploading ? "Subiendo..." : "Subir imagen"}
          </button>
          
          {uploadedUrl && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">URL de la imagen subida:</p>
              <div className="p-2 bg-gray-100 rounded-md overflow-x-auto">
                <code className="text-xs break-all">{uploadedUrl}</code>
              </div>
              <img 
                src={uploadedUrl} 
                alt="Imagen subida" 
                className="mt-2 max-h-40 rounded-md" 
              />
            </div>
          )}
        </div>
        
        <div className="border p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Logs</h2>
          <div className="bg-gray-900 text-gray-100 p-3 rounded-md h-96 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-xs font-mono mb-1">{log}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 