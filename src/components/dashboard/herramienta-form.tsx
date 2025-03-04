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

type FormValues = z.infer<typeof herramientaSchema>;

interface HerramientaFormProps {
  herramienta?: Herramienta;
}

export function HerramientaForm({ herramienta }: HerramientaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (herramienta) {
        // Actualizar herramienta existente
        const { error: updateError } = await supabase
          .from('herramientas')
          .update(data)
          .eq('id', herramienta.id);

        if (updateError) throw updateError;
      } else {
        // Crear nueva herramienta
        const { error: insertError } = await supabase
          .from('herramientas')
          .insert(data);

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

        <div>
          <FormLabel htmlFor="imagen_url">URL de la imagen</FormLabel>
          <Input
            id="imagen_url"
            placeholder="https://ejemplo.com/imagen.jpg"
            {...register('imagen_url')}
            className={errors.imagen_url ? 'border-red-500' : ''}
          />
          {errors.imagen_url && (
            <FormError>{errors.imagen_url.message}</FormError>
          )}
          <p className="text-xs text-slate-500 mt-1">
            URL de una imagen para representar esta herramienta (opcional)
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