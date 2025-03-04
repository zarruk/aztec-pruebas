'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { tallerSchema } from '@/lib/schemas';
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
import ImageUpload from '@/components/ui/image-upload';
import { createClient } from '@supabase/supabase-js';
import { JsonEditor } from '@/components/ui/json-editor';
import { KeyValueEditor } from '@/components/ui/key-value-editor';

type FormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  taller?: Taller;
  onError?: (error: string | null) => void;
}

export function TallerForm({ taller, onError }: TallerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(taller?.imagen_url || '');
  
  console.log("TallerForm recibió taller para editar:", taller);
  console.log("ID del taller a editar:", taller?.id);

  // Crear cliente de Supabase directamente
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  // Asegurarnos de que campos_webhook sea un objeto
  const webhookFields = taller?.campos_webhook && typeof taller.campos_webhook === 'object' 
    ? taller.campos_webhook 
    : {};
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormValues>({
    resolver: zodResolver(tallerSchema),
    defaultValues: {
      nombre: taller?.nombre || '',
      descripcion: taller?.descripcion || '',
      video_url: taller?.video_url || '',
      tipo: taller?.tipo || 'pregrabado',
      fecha_vivo: taller?.fecha_vivo ? new Date(taller.fecha_vivo) : undefined,
      fecha_live_build: taller?.fecha_live_build ? new Date(taller.fecha_live_build) : undefined,
      precio: taller?.precio?.toString() || '0',
      capacidad: taller?.capacidad?.toString() || '0',
      herramientas: taller?.herramientas || [],
      campos_webhook: webhookFields || {}, // Asegurarnos de que siempre sea un objeto
      // ... otros campos ...
    },
  });

  const tipoTaller = watch('tipo');

  // Función para manejar la carga de imagen
  const handleImageUpload = (url: string) => {
    console.log("URL de imagen recibida:", url);
    setImageUrl(url);
  };

  // Función para manejar cambios en los campos del webhook
  const handleWebhookFieldsChange = (fields: Record<string, string>) => {
    setValue('campos_webhook', fields);
  };

  // Función simplificada para crear/actualizar taller
  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);
      if (onError) onError(null);

      // Asegurarnos de que campos_webhook sea un objeto válido
      const webhookFields = typeof data.campos_webhook === 'object' && data.campos_webhook !== null
        ? data.campos_webhook
        : {};
      
      console.log("SUBMIT: Campos webhook a guardar:", webhookFields);

      if (taller?.id) {
        console.log("SUBMIT: Actualizando taller existente con ID:", taller.id);
        
        // Actualizar con todos los campos, incluyendo campos_webhook como objeto JSON
        const { error } = await supabase
          .from('talleres')
          .update({
            nombre: data.nombre,
            descripcion: data.descripcion,
            video_url: data.video_url || '',
            tipo: data.tipo || 'pregrabado',
            fecha_vivo: data.fecha_vivo ? new Date(data.fecha_vivo).toISOString() : null,
            fecha_live_build: data.fecha_live_build ? new Date(data.fecha_live_build).toISOString() : null,
            precio: parseInt(data.precio as string) || 0,
            capacidad: parseInt(data.capacidad as string) || 0,
            imagen_url: imageUrl || taller.imagen_url || '',
            herramientas: Array.isArray(data.herramientas) ? data.herramientas : [],
            campos_webhook: webhookFields // Ahora debería funcionar correctamente
          })
          .eq('id', taller.id);

        if (error) {
          console.error("SUBMIT: Error al actualizar taller:", error);
          throw new Error(`Error al actualizar: ${error.message}`);
        }
        
        console.log("SUBMIT: Taller actualizado correctamente");
        toast.success("Taller actualizado correctamente");
        
        // Redirigir después de un breve retraso para asegurar que el toast se muestre
        setTimeout(() => {
          router.push('/dashboard/talleres');
          router.refresh();
        }, 1000);
      } else {
        console.log("SUBMIT: Creando nuevo taller");
        
        const { error } = await supabase
          .from('talleres')
          .insert({
            nombre: data.nombre,
            descripcion: data.descripcion,
            video_url: data.video_url || '',
            tipo: data.tipo || 'pregrabado',
            fecha_vivo: data.fecha_vivo ? new Date(data.fecha_vivo).toISOString() : null,
            fecha_live_build: data.fecha_live_build ? new Date(data.fecha_live_build).toISOString() : null,
            precio: parseInt(data.precio as string) || 0,
            capacidad: parseInt(data.capacidad as string) || 0,
            imagen_url: imageUrl || '',
            herramientas: data.herramientas || [],
            campos_webhook: data.campos_webhook || {}
          });

        if (error) {
          console.error("SUBMIT: Error al crear taller:", error);
          throw new Error(`Error al crear: ${error.message}`);
        }
        
        console.log("SUBMIT: Taller creado correctamente");
        toast.success("Taller creado correctamente");
        
        // Redirigir después de un breve retraso
        setTimeout(() => {
          router.push('/dashboard/talleres');
          router.refresh();
        }, 1000);
      }
    } catch (err: any) {
      console.error('SUBMIT: Error general:', err);
      const errorMsg = 'Error: ' + (err.message || 'Error desconocido');
      setError(errorMsg);
      if (onError) onError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Añadir esta función para verificar la estructura de la tabla
  const checkTableStructure = async () => {
    if (!taller?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('talleres')
        .select('campos_webhook')
        .eq('id', taller.id)
        .single();
        
      if (error) {
        console.error("Error al verificar estructura:", error);
        return;
      }
      
      console.log("Estructura de campos_webhook en la tabla:", {
        value: data.campos_webhook,
        type: typeof data.campos_webhook,
        isArray: Array.isArray(data.campos_webhook)
      });
      
      // Basado en esta información, podemos adaptar nuestro código
    } catch (err) {
      console.error("Error al verificar estructura:", err);
    }
  };

  // Llamar a esta función cuando se carga el componente
  useEffect(() => {
    if (taller?.id) {
      checkTableStructure();
    }
  }, [taller?.id]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <FormLabel htmlFor="nombre" required>Nombre del taller</FormLabel>
        <Input
          id="nombre"
          placeholder="Nombre del taller"
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
          placeholder="Descripción del taller"
          rows={4}
          {...register('descripcion')}
          className={errors.descripcion ? 'border-red-500' : ''}
        />
        {errors.descripcion && (
          <FormError>{errors.descripcion.message}</FormError>
        )}
      </div>

      <div>
        <FormLabel htmlFor="video_url">URL del video</FormLabel>
        <Input
          id="video_url"
          placeholder="https://www.youtube.com/watch?v=..."
          {...register('video_url')}
          className={errors.video_url ? 'border-red-500' : ''}
        />
        {errors.video_url && (
          <FormError>{errors.video_url.message}</FormError>
        )}
      </div>

      <div>
        <FormLabel>Tipo de taller</FormLabel>
        <Controller
          name="tipo"
          control={control}
          render={({ field }) => (
            <RadioGroup
              value={field.value}
              onValueChange={field.onChange}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="vivo" id="vivo" />
                <label htmlFor="vivo">En vivo</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="pregrabado" id="pregrabado" />
                <label htmlFor="pregrabado">Pregrabado</label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="live_build" id="live_build" />
                <label htmlFor="live_build">Live Build</label>
              </div>
            </RadioGroup>
          )}
        />
        {errors.tipo && (
          <FormError>{errors.tipo.message}</FormError>
        )}
      </div>

      {tipoTaller === 'vivo' && (
        <div>
          <FormLabel htmlFor="fecha_vivo">Fecha del taller en vivo</FormLabel>
          <Input
            id="fecha_vivo"
            type="date"
            {...register('fecha_vivo')}
            className={errors.fecha_vivo ? 'border-red-500' : ''}
          />
          {errors.fecha_vivo && (
            <FormError>{errors.fecha_vivo.message}</FormError>
          )}
        </div>
      )}

      {tipoTaller === 'live_build' && (
        <div>
          <FormLabel htmlFor="fecha_live_build">Fecha del Live Build</FormLabel>
          <Input
            id="fecha_live_build"
            type="date"
            {...register('fecha_live_build')}
            className={errors.fecha_live_build ? 'border-red-500' : ''}
          />
          {errors.fecha_live_build && (
            <FormError>{errors.fecha_live_build.message}</FormError>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormLabel htmlFor="capacidad" required>Capacidad</FormLabel>
          <Input
            id="capacidad"
            type="number"
            placeholder="Número de participantes"
            {...register('capacidad')}
            className={errors.capacidad ? 'border-red-500' : ''}
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
            placeholder="Precio en CLP"
            {...register('precio')}
            className={errors.precio ? 'border-red-500' : ''}
          />
          {errors.precio && (
            <FormError>{errors.precio.message}</FormError>
          )}
        </div>
      </div>

      <div>
        <FormLabel>Imagen del taller</FormLabel>
        <ImageUpload
          onImageUpload={handleImageUpload}
          initialImageUrl={taller?.imagen_url}
        />
      </div>

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
            />
          )}
        />
        {errors.herramientas && (
          <FormError>{errors.herramientas.message}</FormError>
        )}
      </div>

      <div>
        <FormLabel>Campos para webhook</FormLabel>
        <div className="mt-2">
          <Controller
            name="campos_webhook"
            control={control}
            render={({ field }) => (
              <KeyValueEditor
                value={field.value || {}} // Asegurarnos de que nunca sea undefined
                onChange={handleWebhookFieldsChange}
                error={!!errors.campos_webhook}
              />
            )}
          />
          {errors.campos_webhook && (
            <FormError>{errors.campos_webhook.message}</FormError>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Define campos adicionales que se enviarán en el webhook cuando alguien se inscriba.
            Ejemplo: "curso_id" = "123", "plataforma" = "zoom"
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/talleres')}
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
