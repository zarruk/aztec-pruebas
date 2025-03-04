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
import { getNextId, generateSafeId } from '@/lib/utils';
import ImageUpload from '@/components/ui/image-upload';
import { DateList } from '@/components/ui/date-list';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/types';

type FormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  taller?: Taller;
}

export function TallerForm({ taller }: TallerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDebug, setImageDebug] = useState<string[]>([]);
  const [fechas, setFechas] = useState<Date[]>(
    taller?.fechas?.map((f: any) => new Date(f.fecha)) || []
  );
  
  // Crear cliente de Supabase directamente
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
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
          capacidad: '20',
          precio: '99000',
        },
  });

  const tipoTaller = watch('tipo');

  // Función para añadir información de depuración
  const addImageDebug = (info: string) => {
    console.log("TallerForm:", info);
    setImageDebug(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${info}`]);
  };

  // Función para manejar la carga de imagen
  const handleImageUpload = (url: string) => {
    addImageDebug(`URL de imagen recibida: ${url}`);
    setImageUrl(url);
  };

  // Función simplificada para crear/actualizar taller
  const onSubmit = async (data: z.infer<typeof tallerSchema>) => {
    setIsSubmitting(true);
    
    try {
      console.log("Datos del formulario:", data);
      
      // Crear cliente de Supabase
      const supabase = createClientComponentClient<Database>();
      
      // Obtener el siguiente ID disponible
      const nextId = await getNextId(supabase, 'talleres');
      console.log("ID asignado para el nuevo taller:", nextId);
      
      // Preparar los datos para la inserción
      const tallerData = {
        id: nextId,
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        fecha_vivo: data.fecha_vivo ? new Date(data.fecha_vivo).toISOString() : null,
        fecha_live_build: data.fecha_live_build ? new Date(data.fecha_live_build).toISOString() : null,
        capacidad: data.capacidad,
        precio: data.precio,
        video_url: data.video_url || "https://example.com/video-placeholder",
        imagen_url: imageUrl || "https://placehold.co/600x400?text=Taller",
        herramientas: data.herramientas || [],
        campos_webhook: data.campos_webhook || []
      };
      
      console.log("Datos a insertar:", tallerData);
      
      // Insertar el taller en la base de datos
      const { data: insertedTaller, error } = await supabase
        .from('talleres')
        .insert([tallerData])
        .select();
      
      if (error) {
        console.error("Error al crear el taller:", error);
        throw error;
      }
      
      console.log("Taller creado exitosamente:", insertedTaller);
      
      // Redireccionar a la página del taller
      router.push(`/dashboard/talleres/${nextId}`);
      
    } catch (error: any) {
      console.error("Error en onSubmit:", error);
      setError("root", { 
        message: `Error al crear el taller: ${error.message || 'Error desconocido'}` 
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función auxiliar para manejar las fechas
  const handleFechas = async (tallerId: number, fechasList: Date[]) => {
    try {
      // Primero eliminar fechas existentes
      await supabase
        .from('taller_fechas')
        .delete()
        .eq('taller_id', tallerId);
      
      // Luego insertar las nuevas fechas
      if (fechasList.length > 0) {
        const fechasData = fechasList.map(fecha => ({
          taller_id: tallerId,
          fecha: fecha.toISOString(),
        }));
        
        const { error: fechasError } = await supabase
          .from('taller_fechas')
          .insert(fechasData);
        
        if (fechasError) {
          console.error("Error al guardar fechas:", fechasError);
        }
      }
    } catch (error) {
      console.error("Error al manejar fechas:", error);
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

        <div className="space-y-2">
          <FormLabel htmlFor="imagen">Imagen del taller</FormLabel>
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
          className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700"
          onClick={() => {
            console.log("Botón de envío clickeado");
            console.log("Errores de formulario:", errors);
          }}
        >
          {isSubmitting ? 'Guardando...' : taller ? 'Actualizar taller' : 'Crear taller'}
        </Button>
      </div>
    </form>
  );
} 