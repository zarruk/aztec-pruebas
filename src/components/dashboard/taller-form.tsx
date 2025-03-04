'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tallerSchema } from '@/lib/schemas';
import { supabase, testSupabaseConnection } from '@/lib/supabase-browser';
import { Taller } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormLabel } from '@/components/ui/form-label';
import { FormError } from '@/components/ui/form-error';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ToolSelector } from '@/components/ui/tool-selector';
import { TagInput } from '@/components/ui/tag-input';
import { toast } from 'react-hot-toast';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type FormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  taller?: Taller;
}

export function TallerForm({ taller }: TallerFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(tallerSchema),
    defaultValues: taller
      ? {
          nombre: taller.nombre,
          descripcion: taller.descripcion,
          video_url: taller.video_url || '',
          tipo: taller.tipo,
          fecha_vivo: taller.fecha_vivo || '',
          fecha_live_build: taller.fecha_live_build || '',
          herramientas: taller.herramientas || [],
          campos_webhook: taller.campos_webhook || [],
          capacidad: taller.capacidad?.toString() || '',
          precio: taller.precio?.toString() || '',
        }
      : {
          nombre: '',
          descripcion: '',
          video_url: '',
          tipo: 'vivo',
          fecha_vivo: '',
          fecha_live_build: '',
          herramientas: [],
          campos_webhook: [],
          capacidad: '',
          precio: '',
        },
  });

  const tipoTaller = watch('tipo');

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // Depurar los datos antes de enviarlos
      console.log('Datos del formulario:', data);

      // Convertir valores numéricos y asegurar que los campos requeridos estén presentes
      const tallerData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        video_url: data.video_url,
        tipo: data.tipo,
        fecha_vivo: data.tipo === 'vivo' ? data.fecha_vivo : null,
        fecha_live_build: data.tipo === 'pregrabado' ? data.fecha_live_build : null,
        // Asegurar que herramientas sea un array
        herramientas: Array.isArray(data.herramientas) ? data.herramientas : [],
        // Asegurar que campos_webhook sea un array
        campos_webhook: Array.isArray(data.campos_webhook) ? data.campos_webhook : [],
        capacidad: data.capacidad ? parseInt(data.capacidad) : 0,
        precio: data.precio ? parseFloat(data.precio) : 0,
      };
      
      console.log('Datos procesados para enviar a Supabase:', tallerData);
      
      let result;
      
      try {
        if (taller) {
          // Actualizar taller existente
          console.log('Actualizando taller existente con ID:', taller.id);
          result = await supabase
            .from('talleres')
            .update(tallerData)
            .eq('id', taller.id);
        } else {
          // Crear nuevo taller
          console.log('Creando nuevo taller');
          result = await supabase
            .from('talleres')
            .insert([tallerData]);
        }
        
        console.log('Respuesta completa de Supabase:', result);
        
        if (result.error) {
          console.error('Error de Supabase:', result.error);
          // Mostrar el mensaje de error específico
          setError(`Error: ${result.error.message || 'Error desconocido al guardar'}`);
          return;
        }
        
        // Verificar si se insertó/actualizó correctamente
        if (result.status >= 200 && result.status < 300) {
          toast.success(taller ? 'Taller actualizado correctamente' : 'Taller creado correctamente');
          setSuccessMessage(taller ? 'Taller actualizado correctamente' : 'Taller creado correctamente');
          
          // Redirigir a la lista de talleres después de un breve retraso
          console.log('Redirigiendo a la lista de talleres...');
          setTimeout(() => {
            router.push('/dashboard/talleres');
            router.refresh();
          }, 500);
        } else {
          throw new Error(`Error de respuesta: ${result.statusText || 'Estado desconocido'}`);
        }
      } catch (supabaseError: any) {
        console.error('Error específico de Supabase:', supabaseError);
        throw supabaseError;
      }
      
    } catch (error: any) {
      console.error('Error al guardar el taller:', error);
      // Mostrar mensaje de error más específico si está disponible
      const errorMessage = error?.message || 'Error al guardar el taller. Por favor, inténtalo de nuevo.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Observar los valores de herramientas y tags
  const selectedHerramientas = watch('herramientas') || [];
  const selectedTags = watch('campos_webhook') || [];

  // Manejar cambios en herramientas seleccionadas
  const handleHerramientasChange = (herramientas: number[]) => {
    setValue('herramientas', herramientas);
  };

  // Manejar cambios en tags
  const handleTagsChange = (tags: string[]) => {
    setValue('campos_webhook', tags);
  };

  useEffect(() => {
    // Probar la conexión a Supabase al cargar el componente
    const testConnection = async () => {
      const result = await testSupabaseConnection();
      console.log('Prueba de conexión a Supabase:', result);
      
      if (!result.success) {
        setError('Error de conexión a Supabase. Por favor, verifica tu configuración.');
      }
    };
    
    testConnection();
  }, []);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 p-4 rounded-md border border-green-200">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <FormLabel htmlFor="nombre" required>Nombre del taller</FormLabel>
          <Input
            id="nombre"
            placeholder="Nombre del taller"
            {...register('nombre')}
            className={`bg-white text-slate-900 ${errors.nombre ? 'border-red-500' : 'border-slate-300'}`}
          />
          {errors.nombre && (
            <FormError>{errors.nombre.message}</FormError>
          )}
        </div>

        <div>
          <FormLabel htmlFor="descripcion" required>Descripción</FormLabel>
          <Textarea
            id="descripcion"
            placeholder="Descripción del taller"
            rows={4}
            {...register('descripcion')}
            className={`bg-white text-slate-900 ${errors.descripcion ? 'border-red-500' : 'border-slate-300'}`}
          />
          {errors.descripcion && (
            <FormError>{errors.descripcion.message}</FormError>
          )}
        </div>

        <div>
          <FormLabel htmlFor="video_url" required>URL del video</FormLabel>
          <Input
            id="video_url"
            placeholder="https://www.youtube.com/watch?v=..."
            {...register('video_url')}
            className={`bg-white text-slate-900 ${errors.video_url ? 'border-red-500' : 'border-slate-300'}`}
          />
          {errors.video_url && (
            <FormError>{errors.video_url.message}</FormError>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="capacidad" required>Capacidad</FormLabel>
            <Input
              id="capacidad"
              type="number"
              placeholder="Número de participantes"
              {...register('capacidad')}
              className={`bg-white text-slate-900 ${errors.capacidad ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.capacidad && (
              <FormError>{errors.capacidad.message}</FormError>
            )}
          </div>

          <div>
            <FormLabel htmlFor="precio" required>Precio</FormLabel>
            <Input
              id="precio"
              type="number"
              step="0.01"
              placeholder="Precio en USD"
              {...register('precio')}
              className={`bg-white text-slate-900 ${errors.precio ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.precio && (
              <FormError>{errors.precio.message}</FormError>
            )}
          </div>
        </div>

        <div>
          <FormLabel required>Tipo de taller</FormLabel>
          <Controller
            name="tipo"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={field.onChange}
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vivo" id="tipo-vivo" />
                  <label htmlFor="tipo-vivo" className="text-sm font-medium leading-none cursor-pointer text-slate-800">
                    Taller en vivo
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pregrabado" id="tipo-pregrabado" />
                  <label htmlFor="tipo-pregrabado" className="text-sm font-medium leading-none cursor-pointer text-slate-800">
                    Taller pre-grabado
                  </label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.tipo && (
            <FormError>{errors.tipo.message}</FormError>
          )}
        </div>

        {tipoTaller === 'vivo' ? (
          <div>
            <FormLabel htmlFor="fecha_vivo">Fecha del taller en vivo</FormLabel>
            <Input
              id="fecha_vivo"
              type="datetime-local"
              {...register('fecha_vivo')}
              className={`bg-white text-slate-900 ${errors.fecha_vivo ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.fecha_vivo && (
              <FormError>{errors.fecha_vivo.message}</FormError>
            )}
          </div>
        ) : (
          <div>
            <FormLabel htmlFor="fecha_live_build">Fecha del live build</FormLabel>
            <Input
              id="fecha_live_build"
              type="datetime-local"
              {...register('fecha_live_build')}
              className={`bg-white text-slate-900 ${errors.fecha_live_build ? 'border-red-500' : 'border-slate-300'}`}
            />
            {errors.fecha_live_build && (
              <FormError>{errors.fecha_live_build.message}</FormError>
            )}
          </div>
        )}

        <div>
          <FormLabel>Herramientas necesarias</FormLabel>
          <Controller
            name="herramientas"
            control={control}
            render={({ field }) => (
              <ToolSelector
                value={field.value}
                onChange={field.onChange}
                error={!!errors.herramientas}
                className="mt-2"
              />
            )}
          />
          {errors.herramientas && (
            <FormError>{errors.herramientas.message}</FormError>
          )}
        </div>

        <div>
          <FormLabel>Campos para webhook</FormLabel>
          <Controller
            name="campos_webhook"
            control={control}
            render={({ field }) => (
              <TagInput
                value={field.value}
                onChange={field.onChange}
                placeholder="Añadir campo y presionar Enter"
                className={errors.campos_webhook ? 'border-red-500' : 'border-slate-300'}
              />
            )}
          />
          {errors.campos_webhook && (
            <FormError>{errors.campos_webhook.message}</FormError>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/talleres')}
          className="w-full md:w-auto"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? 'Guardando...' : taller ? 'Actualizar taller' : 'Crear taller'}
        </Button>
      </div>
    </form>
  );
} 