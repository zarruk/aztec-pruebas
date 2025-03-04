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
import { getNextId } from '@/lib/utils';
import { ImageUpload } from '@/components/ui/image-upload';
import { DateList } from '@/components/ui/date-list';
import { createClient } from '@supabase/supabase-js';

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
  const [imageUrl, setImageUrl] = useState<string>(taller?.imagen_url || '');
  const [fechas, setFechas] = useState<Date[]>(
    taller?.fechas?.map((f: any) => new Date(f.fecha)) || []
  );

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
          fecha_vivo: taller.fecha_vivo ? new Date(taller.fecha_vivo).toISOString().split('T')[0] : '',
          fecha_live_build: taller.fecha_live_build ? new Date(taller.fecha_live_build).toISOString().split('T')[0] : '',
          herramientas: taller.herramientas || [],
          campos_webhook: taller.campos_webhook || [],
          capacidad: taller.capacidad?.toString() || '20',
          precio: taller.precio?.toString() || '99000',
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
    setIsSubmitting(true);
    
    try {
      let nextId = null;
      
      // Solo obtener el siguiente ID si estamos creando un nuevo taller
      if (!taller?.id) {
        nextId = await getNextId('talleres');
        
        if (nextId === null) {
          toast.error("Error al generar el ID del taller. Por favor, intenta de nuevo.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Preparar los datos del taller
      const tallerData = {
        ...(nextId !== null && { id: nextId }), // Solo incluir el ID si es un nuevo taller
        nombre: data.nombre,
        descripcion: data.descripcion,
        video_url: data.video_url,
        tipo: data.tipo,
        fecha_vivo: data.tipo === 'vivo' ? data.fecha_vivo : null,
        fecha_live_build: data.tipo === 'pregrabado' ? data.fecha_live_build : null,
        herramientas: data.herramientas,
        campos_webhook: data.campos_webhook,
        capacidad: parseInt(data.capacidad),
        precio: parseInt(data.precio),
        imagen_url: imageUrl,
      };
      
      // Si estamos editando un taller existente, no cambiamos el ID
      if (taller?.id) {
        delete tallerData.id; // Eliminar el ID para no sobrescribir el existente
        
        const { error: updateError } = await supabase
          .from('talleres')
          .update(tallerData)
          .eq('id', taller.id);
        
        if (updateError) {
          console.error("Error al actualizar el taller:", updateError);
          toast.error("Error al actualizar el taller. Por favor, intenta de nuevo.");
          setIsSubmitting(false);
          return;
        }
        
        // Si es un taller en vivo, actualizar las fechas
        if (data.tipo === 'vivo') {
          // Primero eliminar todas las fechas existentes
          await supabase
            .from('taller_fechas')
            .delete()
            .eq('taller_id', taller.id);
          
          // Luego insertar las nuevas fechas
          if (fechas.length > 0) {
            const fechasData = fechas.map(fecha => ({
              taller_id: taller.id,
              fecha: fecha.toISOString(),
            }));
            
            const { error: fechasError } = await supabase
              .from('taller_fechas')
              .insert(fechasData);
            
            if (fechasError) {
              console.error("Error al guardar las fechas:", fechasError);
              toast.error("Error al guardar las fechas. Por favor, verifica manualmente.");
            }
          }
        }
        
        toast.success("Taller actualizado correctamente");
        router.push('/dashboard/talleres');
      } else {
        // Crear un nuevo taller con el ID consecutivo
        const { error: insertError } = await supabase
          .from('talleres')
          .insert([tallerData]);
        
        if (insertError) {
          console.error("Error al crear el taller:", insertError);
          toast.error("Error al crear el taller. Por favor, intenta de nuevo.");
          setIsSubmitting(false);
          return;
        }
        
        // Si es un taller en vivo, guardar las fechas
        if (data.tipo === 'vivo') {
          const tallerId = tallerData.id;
          
          if (fechas.length > 0) {
            const fechasData = fechas.map(fecha => ({
              taller_id: tallerId,
              fecha: fecha.toISOString(),
            }));
            
            const { error: fechasError } = await supabase
              .from('taller_fechas')
              .insert(fechasData);
            
            if (fechasError) {
              console.error("Error al guardar las fechas:", fechasError);
              toast.error("Error al guardar las fechas. Por favor, verifica manualmente.");
            }
          }
        }
        
        toast.success("Taller creado correctamente");
        router.push('/dashboard/talleres');
      }
    } catch (error) {
      console.error("Error inesperado:", error);
      toast.error("Error inesperado. Por favor, intenta de nuevo.");
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

  // Cargar las fechas existentes si es un taller en edición
  useEffect(() => {
    if (taller?.id && taller.tipo === 'vivo') {
      const loadFechas = async () => {
        const { data, error } = await supabase
          .from('taller_fechas')
          .select('*')
          .eq('taller_id', taller.id);
        
        if (error) {
          console.error("Error al cargar fechas:", error);
          return;
        }
        
        if (data && data.length > 0) {
          setFechas(data.map(item => new Date(item.fecha)));
        }
      };
      
      loadFechas();
    }
  }, [taller]);

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
            <DateList 
              dates={fechas} 
              onChange={setFechas} 
            />
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

        <div>
          <FormLabel>Imagen del taller</FormLabel>
          <ImageUpload 
            onImageUploaded={setImageUrl} 
            defaultImage={imageUrl}
          />
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