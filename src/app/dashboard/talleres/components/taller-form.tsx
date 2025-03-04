'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tallerSchema } from '@/lib/schemas';
import { supabase } from '@/lib/supabase';
import { Taller, TipoTaller } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form-label';
import { FormError } from '@/components/ui/form-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerInput } from '@/components/ui/date-picker';
import { TagInput } from '@/components/ui/tag-input';
import { ToolSelector } from '@/components/ui/tool-selector';
import ImageUpload from '@/components/ui/image-upload';

type FormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  taller?: Taller;
}

export function TallerForm({ taller }: TallerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(tallerSchema),
    defaultValues: taller
      ? {
          nombre: taller.nombre,
          descripcion: taller.descripcion,
          video_url: taller.video_url,
          tipo: taller.tipo,
          fecha_vivo: taller.fecha_vivo,
          fecha_live_build: taller.fecha_live_build,
          herramientas: taller.herramientas,
          campos_webhook: taller.campos_webhook || [],
          imagen_url: taller.imagen_url || '',
        }
      : {
          nombre: '',
          descripcion: '',
          video_url: '',
          tipo: 'vivo' as TipoTaller,
          herramientas: [],
          campos_webhook: [],
          imagen_url: '',
        },
  });

  const tipoTaller = watch('tipo');

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      if (taller) {
        // Actualizar taller existente
        const { error: updateError } = await supabase
          .from('talleres')
          .update(data)
          .eq('id', taller.id);

        if (updateError) throw updateError;
      } else {
        // Crear nuevo taller
        const { error: insertError } = await supabase
          .from('talleres')
          .insert(data);

        if (insertError) throw insertError;
      }

      // Redirigir a la lista de talleres
      router.push('/dashboard/talleres');
      router.refresh();
    } catch (err) {
      console.error('Error al guardar el taller:', err);
      setError('Error al guardar el taller. Por favor, intenta de nuevo.');
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
          <FormLabel htmlFor="nombre" required>Nombre del taller</FormLabel>
          <Input
            id="nombre"
            placeholder="Nombre del taller"
            {...register('nombre')}
            className={errors.nombre ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <FormError message={errors.nombre?.message} />
        </div>

        <div>
          <FormLabel htmlFor="descripcion" required>Descripción</FormLabel>
          <Textarea
            id="descripcion"
            placeholder="Descripción del taller"
            {...register('descripcion')}
            className={errors.descripcion ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <FormError message={errors.descripcion?.message} />
        </div>

        <div>
          <FormLabel htmlFor="video_url" required>URL del video</FormLabel>
          <Input
            id="video_url"
            placeholder="https://ejemplo.com/video.mp4"
            {...register('video_url')}
            className={errors.video_url ? 'border-destructive' : ''}
            disabled={isSubmitting}
          />
          <FormError message={errors.video_url?.message} />
          <p className="text-xs text-muted-foreground mt-1">
            URL del video que contiene la información del taller.
          </p>
        </div>

        <div>
          <FormLabel htmlFor="imagen_url">Imagen del taller</FormLabel>
          <Controller
            name="imagen_url"
            control={control}
            render={({ field }) => (
              <ImageUpload
                onImageUpload={(url) => field.onChange(url)}
                initialImageUrl={field.value}
              />
            )}
          />
          <FormError message={errors.imagen_url?.message} />
          <p className="text-xs text-muted-foreground mt-1">
            Sube una imagen representativa para el taller. Esta imagen se mostrará en la página de talleres.
          </p>
        </div>

        <div>
          <FormLabel htmlFor="tipo" required>Tipo de taller</FormLabel>
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isSubmitting}
              >
                <SelectTrigger 
                  id="tipo"
                  className={errors.tipo ? 'border-destructive' : ''}
                >
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vivo">En vivo</SelectItem>
                  <SelectItem value="pregrabado">Pre-grabado</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FormError message={errors.tipo?.message} />
        </div>

        {tipoTaller === 'vivo' && (
          <div>
            <FormLabel htmlFor="fecha_vivo" required>Fecha del taller en vivo</FormLabel>
            <Controller
              name="fecha_vivo"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : null)}
                  error={!!errors.fecha_vivo}
                  disabled={isSubmitting}
                />
              )}
            />
            <FormError message={errors.fecha_vivo?.message} />
          </div>
        )}

        {tipoTaller === 'pregrabado' && (
          <div>
            <FormLabel htmlFor="fecha_live_build">Fecha del live build (opcional)</FormLabel>
            <Controller
              name="fecha_live_build"
              control={control}
              render={({ field }) => (
                <DatePickerInput
                  value={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date ? date.toISOString() : null)}
                  error={!!errors.fecha_live_build}
                  disabled={isSubmitting}
                />
              )}
            />
            <FormError message={errors.fecha_live_build?.message} />
            <p className="text-xs text-muted-foreground mt-1">
              Esta fecha es opcional para talleres pregrabados.
            </p>
          </div>
        )}

        <div>
          <FormLabel>Herramientas</FormLabel>
          <Controller
            name="herramientas"
            control={control}
            render={({ field }) => (
              <ToolSelector
                value={field.value}
                onChange={field.onChange}
                error={!!errors.herramientas}
                disabled={isSubmitting}
              />
            )}
          />
          <FormError message={errors.herramientas?.message} />
          <p className="text-xs text-muted-foreground mt-1">
            Selecciona las herramientas que se utilizarán en este taller.
          </p>
        </div>

        <div>
          <FormLabel>Campos adicionales para webhook</FormLabel>
          <Controller
            name="campos_webhook"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value}
                onChange={field.onChange}
                error={!!errors.campos_webhook}
                disabled={isSubmitting}
              />
            )}
          />
          <FormError message={errors.campos_webhook?.message} />
          <p className="text-xs text-muted-foreground mt-1">
            Agrega campos adicionales que se enviarán en el webhook cuando alguien se registre.
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
          {isSubmitting ? 'Guardando...' : taller ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
} 