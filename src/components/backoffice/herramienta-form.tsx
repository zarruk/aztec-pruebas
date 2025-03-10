'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Herramienta } from '@/lib/types';

interface HerramientaFormProps {
  herramienta?: Herramienta;
  isEditing?: boolean;
}

export function HerramientaForm({ herramienta, isEditing = false }: HerramientaFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState(herramienta?.nombre || '');
  const [descripcion, setDescripcion] = useState(herramienta?.descripcion || '');
  const [imagenUrl, setImagenUrl] = useState(herramienta?.imagen_url || '');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(herramienta?.imagen_url || null);

  // Manejar cambio de archivo de imagen
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Crear URL para previsualización
    const fileReader = new FileReader();
    fileReader.onload = () => {
      if (typeof fileReader.result === 'string') {
        setPreviewUrl(fileReader.result);
      }
    };
    fileReader.readAsDataURL(selectedFile);
  };

  // Subir imagen a Supabase Storage
  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `herramientas/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('imagenes')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Error al subir imagen: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from('imagenes')
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Validar campos
      if (!nombre.trim()) {
        throw new Error('El nombre es obligatorio');
      }

      if (!descripcion.trim()) {
        throw new Error('La descripción es obligatoria');
      }

      // Preparar datos para guardar
      let finalImageUrl = imagenUrl;

      // Si hay un archivo nuevo, subirlo
      if (file) {
        finalImageUrl = await uploadImage(file);
      }

      const herramientaData = {
        nombre,
        descripcion,
        imagen_url: finalImageUrl,
      };

      let result;

      if (isEditing && herramienta) {
        // Actualizar herramienta existente
        result = await supabase
          .from('herramientas')
          .update(herramientaData)
          .eq('id', herramienta.id);
      } else {
        // Crear nueva herramienta
        result = await supabase
          .from('herramientas')
          .insert([herramientaData]);
      }

      if (result.error) {
        throw result.error;
      }

      setSuccessMessage(isEditing ? 'Herramienta actualizada correctamente' : 'Herramienta creada correctamente');
      
      // Redirigir después de un breve retraso
      setTimeout(() => {
        router.push('/backoffice/herramientas');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error('Error al guardar herramienta:', err);
      setError(err.message || 'Error al guardar la herramienta');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6">
        {isEditing ? 'Editar Herramienta' : 'Crear Nueva Herramienta'}
      </h2>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6">
          <p className="font-medium">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Nombre de la herramienta"
            required
          />
        </div>

        <div>
          <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">
            Descripción <span className="text-red-500">*</span>
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Descripción de la herramienta"
            rows={4}
            required
          />
        </div>

        <div>
          <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">
            Imagen
          </label>
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Vista previa" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-grow">
              <input
                type="file"
                id="imagen"
                onChange={handleFileChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                accept="image/*"
              />
              <p className="mt-1 text-sm text-gray-500">
                Formatos recomendados: JPG, PNG. Tamaño máximo: 2MB.
              </p>
              {!file && imagenUrl && (
                <div className="mt-2">
                  <label htmlFor="imagenUrl" className="block text-sm font-medium text-gray-700 mb-1">
                    URL de la imagen
                  </label>
                  <input
                    type="text"
                    id="imagenUrl"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => router.push('/backoffice/herramientas')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-700 text-white rounded-md hover:bg-emerald-800 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
          </button>
        </div>
      </form>
    </div>
  );
} 