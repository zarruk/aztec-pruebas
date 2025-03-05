'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { herramientaSchema } from '@/lib/schemas';
import { supabase } from '@/lib/supabase';
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md">
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
            className={errors.nombre ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <FormError>{errors.nombre?.message}</FormError>
        </div>

        <div>
          <FormLabel htmlFor="descripcion" required>Descripción</FormLabel>
          <Textarea
            id="descripcion"
            placeholder="Descripción de la herramienta"
            {...register('descripcion')}
            className={errors.descripcion ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <FormError>{errors.descripcion?.message}</FormError>
        </div>

        <div>
          <FormLabel htmlFor="imagen_url" required>URL de la imagen</FormLabel>
          <Input
            id="imagen_url"
            placeholder="https://ejemplo.com/imagen.jpg"
            {...register('imagen_url')}
            className={errors.imagen_url ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <FormError>{errors.imagen_url?.message}</FormError>
          <p className="text-xs text-muted-foreground mt-1">
            Ingresa la URL de una imagen para representar esta herramienta.
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : herramienta ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
} 