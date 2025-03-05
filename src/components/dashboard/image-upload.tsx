"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  initialImageUrl?: string;
}

export default function ImageUpload({ onImageUpload, initialImageUrl }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialImageUrl || null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");

  // Efecto para inicializar con la URL inicial si existe
  useEffect(() => {
    if (initialImageUrl) {
      setPreviewUrl(initialImageUrl);
      console.log("ImageUpload: Inicializado con URL:", initialImageUrl);
      addDebugInfo(`Inicializado con URL: ${initialImageUrl}`);
    }
  }, [initialImageUrl]);

  const addDebugInfo = (info: string) => {
    setDebugInfo(prev => `${prev}\n[${new Date().toLocaleTimeString()}] ${info}`);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const file = e.target.files[0];
    console.log("ImageUpload: Archivo seleccionado:", file.name, file.size, file.type);
    addDebugInfo(`Archivo seleccionado: ${file.name} (${file.size} bytes, ${file.type})`);
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setUploadError('El archivo debe ser una imagen');
      toast.error('El archivo debe ser una imagen');
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La imagen no debe superar los 5MB');
      toast.error('La imagen no debe superar los 5MB');
      return;
    }
    
    // Crear URL para vista previa
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    addDebugInfo(`Vista previa creada: ${objectUrl}`);
    
    // Subir la imagen automáticamente
    await handleImageUpload(file);
  };

  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      console.log("ImageUpload: Iniciando carga de imagen:", file.name);
      addDebugInfo(`Iniciando carga de imagen: ${file.name}`);
      
      // Crear cliente de Supabase
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      addDebugInfo(`URL Supabase: ${supabaseUrl}`);
      addDebugInfo(`Key exists: ${!!supabaseKey}`);
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error("Faltan variables de entorno de Supabase");
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Generar un nombre único para el archivo
      const fileExt = file.name.split('.').pop();
      const fileName = `taller_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `talleres/${fileName}`;
      
      console.log("ImageUpload: Subiendo archivo a:", filePath);
      addDebugInfo(`Subiendo archivo a: ${filePath}`);
      
      // Subir la imagen a Supabase Storage
      const { data, error } = await supabase.storage
        .from('imagenes')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error("ImageUpload: Error al subir imagen:", error);
        addDebugInfo(`ERROR al subir: ${error.message}`);
        throw error;
      }
      
      console.log("ImageUpload: Imagen subida exitosamente:", data);
      addDebugInfo(`Imagen subida exitosamente: ${JSON.stringify(data)}`);
      
      // Obtener la URL pública de la imagen
      const { data: urlData } = supabase.storage
        .from('imagenes')
        .getPublicUrl(filePath);
      
      const imageUrl = urlData.publicUrl;
      console.log("ImageUpload: URL pública obtenida:", imageUrl);
      addDebugInfo(`URL pública obtenida: ${imageUrl}`);
      
      // Actualizar el estado con la URL de la imagen
      setPreviewUrl(imageUrl);
      
      // Llamar al callback con la URL
      console.log("ImageUpload: Llamando a onImageUpload con URL:", imageUrl);
      addDebugInfo(`Llamando a onImageUpload con URL: ${imageUrl}`);
      onImageUpload(imageUrl);
      
      toast.success('Imagen subida correctamente');
    } catch (error: any) {
      console.error("ImageUpload: Error completo:", error);
      addDebugInfo(`ERROR COMPLETO: ${error.message}`);
      setUploadError(`Error al subir la imagen: ${error.message || 'Error desconocido'}`);
      toast.error(`Error: ${error.message || 'Error al subir la imagen'}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="dropzone-file"
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer ${
            isUploading ? 'bg-gray-100' : 'bg-gray-50 hover:bg-gray-100'
          } ${uploadError ? 'border-red-300' : 'border-gray-300'}`}
        >
          {previewUrl ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={previewUrl}
                alt="Vista previa"
                className="max-h-full max-w-full p-2 object-contain"
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg
                className="w-8 h-8 mb-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 16"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
              </p>
              <p className="text-xs text-gray-500">PNG, JPG o GIF (Máx. 5MB)</p>
              {isUploading && <p className="text-sm text-emerald-500 mt-2">Subiendo imagen...</p>}
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </label>
      </div>
      
      {uploadError && (
        <p className="text-sm text-red-500">{uploadError}</p>
      )}
      
      {previewUrl && !isUploading && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setPreviewUrl(null);
              onImageUpload('');
              addDebugInfo("Imagen eliminada, URL limpiada");
            }}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Eliminar imagen
          </button>
          
          <div className="text-xs text-gray-500 break-all">
            <p>URL de la imagen: {previewUrl}</p>
          </div>
        </div>
      )}
      
      {/* Sección de depuración */}
      <details className="mt-4">
        <summary className="text-xs text-gray-500 cursor-pointer">Información de depuración</summary>
        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
          {debugInfo || "No hay información de depuración disponible."}
        </div>
      </details>
    </div>
  );
} 