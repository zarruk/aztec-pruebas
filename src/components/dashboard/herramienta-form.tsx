'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { herramientaSchema } from '@/lib/schemas';
import { supabase } from '@/lib/supabase-browser';
import { Herramienta } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form-label';
import { FormError } from '@/components/ui/form-error';
import ImageUpload from '@/components/ui/image-upload';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type FormValues = z.infer<typeof herramientaSchema>;

interface HerramientaFormProps {
  herramienta?: Herramienta;
}

export function HerramientaForm({ herramienta }: HerramientaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(herramienta?.imagen_url || '');
  const [imageDebug, setImageDebug] = useState<string[]>([]);
  
  // Crear cliente de Supabase una sola vez
  const supabaseClient = createClientComponentClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(herramientaSchema),
    defaultValues: herramienta
      ? {
          nombre: herramienta.nombre,
          descripcion: herramienta.descripcion,
          imagen_url: herramienta.imagen_url,
        }
      : {
          nombre: '',
          descripcion: '',
          imagen_url: '',
        },
  });

  // Función para añadir información de depuración
  const addImageDebug = (info: string) => {
    console.log("HerramientaForm:", info);
    setImageDebug(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${info}`]);
  };

  // Función para manejar la carga de imagen
  const handleImageUpload = (url: string) => {
    addImageDebug(`URL de imagen recibida: ${url}`);
    setImageUrl(url);
    setValue('imagen_url', url);
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Asegurarse de que la URL de la imagen esté actualizada
      const formData = {
        ...data,
        imagen_url: imageUrl || data.imagen_url
      };

      if (herramienta) {
        // Actualizar herramienta existente
        const { error: updateError } = await supabaseClient
          .from('herramientas')
          .update(formData)
          .eq('id', herramienta.id);

        if (updateError) throw updateError;
      } else {
        // Crear nueva herramienta
        const { error: insertError } = await supabaseClient
          .from('herramientas')
          .insert(formData);

        if (insertError) throw insertError;
      }

      // Redirigir a la lista de herramientas
      router.push('/dashboard/herramientas');
      router.refresh();
    } catch (err) {
      console.error('Error al guardar la herramienta:', err);
      setError('Error al guardar la herramienta. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <FormLabel htmlFor="nombre" required>Nombre</FormLabel>
          <Input
            id="nombre"
            placeholder="Nombre de la herramienta"
            {...register('nombre')}
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <FormError>{errors.nombre.message}</FormError>
          )}
        </div>

        <div>
          <FormLabel htmlFor="descripcion" required>Descripción</FormLabel>
          <Textarea
            id="descripcion"
            placeholder="Descripción de la herramienta"
            rows={4}
            {...register('descripcion')}
            className={errors.descripcion ? 'border-red-500' : ''}
          />
          {errors.descripcion && (
            <FormError>{errors.descripcion.message}</FormError>
          )}
        </div>

        <div className="space-y-2">
          <FormLabel htmlFor="imagen">Imagen de la herramienta</FormLabel>
          <ImageUpload onImageUpload={handleImageUpload} />
          {imageUrl && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">Imagen seleccionada:</p>
              <img 
                src={imageUrl} 
                alt="Vista previa" 
                className="mt-2 max-h-40 rounded-md" 
              />
              <p className="text-xs text-gray-500 break-all mt-1">URL: {imageUrl}</p>
            </div>
          )}
          
          {/* Sección de depuración */}
          <details className="mt-4">
            <summary className="text-xs text-gray-500 cursor-pointer">Información de depuración de imagen</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap max-h-40 overflow-y-auto">
              {imageDebug.map((log, index) => (
                <div key={index}>{log}</div>
              ))}
            </div>
          </details>
        </div>

        <div>
          <FormLabel htmlFor="imagen_url">URL de la imagen (opcional)</FormLabel>
          <Input
            id="imagen_url"
            placeholder="https://ejemplo.com/imagen.jpg"
            {...register('imagen_url')}
            className={errors.imagen_url ? 'border-red-500' : ''}
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setValue('imagen_url', e.target.value);
            }}
          />
          {errors.imagen_url && (
            <FormError>{errors.imagen_url.message}</FormError>
          )}
          <p className="text-xs text-slate-500 mt-1">
            Puedes subir una imagen usando el control de arriba o ingresar directamente una URL
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <a 
          href="/dashboard/herramientas" 
          className="inline-flex items-center justify-center px-5 py-3 border-2 border-slate-300 bg-white text-slate-800 font-medium rounded-md hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </a>
        <button 
          type="submit" 
          className="inline-flex items-center justify-center px-5 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 transition-colors shadow-md border-2 border-primary-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Guardando...
            </>
          ) : (
            <>
              {herramienta ? 'Actualizar' : 'Crear'}
            </>
          )}
        </button>
      </div>
    </form>
  );
} 