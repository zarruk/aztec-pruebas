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
import { DatePickerInput, MultiDatePickerInput } from '@/components/ui/date-picker';
import { createClient } from '@supabase/supabase-js';
import { KeyValueInput } from '@/components/ui/key-value-input';

type FormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  taller?: Taller;
  backofficeMode?: boolean;
}

interface TallerFormData {
  nombre: string;
  descripcion: string;
  video_url: string;
  tipo: string;
  fecha: string;
  herramientas: number[];
  campos_webhook: string[];
  capacidad: string;
  precio: string;
  tags: string[];
}

export function TallerForm({ taller, backofficeMode = false }: TallerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageDebug, setImageDebug] = useState<string[]>([]);
  const [fechas, setFechas] = useState<Date[]>(
    taller?.fechas?.map((f: any) => new Date(f.fecha)) || []
  );
  
  // Crear cliente de Supabase una sola vez
  const supabaseClient = createClientComponentClient();

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
          fecha: taller.fecha ? new Date(taller.fecha).toISOString().split('T')[0] : '',
          herramientas: taller.herramientas || [],
          campos_webhook: Array.isArray(taller.campos_webhook) ? taller.campos_webhook : [],
          capacidad: taller.capacidad?.toString() || '20',
          precio: taller.precio?.toString() || '99000',
        }
      : {
          nombre: '',
          descripcion: '',
          video_url: '',
          tipo: 'vivo',
          fecha: '',
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

  // Función para limitar el tamaño de un número para que no exceda el rango de INTEGER en PostgreSQL
  const safeInteger = (value: any, defaultValue: number = 0): number => {
    // Convertir a número
    let num = Number(value);
    
    // Verificar si es un número válido
    if (isNaN(num)) {
      return defaultValue;
    }
    
    // Limitar al rango seguro de INTEGER en PostgreSQL (-2147483648 a 2147483647)
    const MAX_INT = 2147483647;
    const MIN_INT = -2147483648;
    
    if (num > MAX_INT) {
      return MAX_INT;
    }
    
    if (num < MIN_INT) {
      return MIN_INT;
    }
    
    return num;
  };

  // Función simplificada para crear/actualizar taller
  const onSubmit = async (data: z.infer<typeof tallerSchema>) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      console.log("Datos del formulario:", data);
      
      // Preparar los datos comunes para inserción o actualización
      const tallerData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        fecha: data.fecha ? new Date(data.fecha).toISOString() : null,
        capacidad: safeInteger(data.capacidad, 20), // Convertir a número seguro
        precio: safeInteger(data.precio, 99000), // Convertir a número seguro
        video_url: data.video_url || "https://example.com/video-placeholder",
        imagen_url: imageUrl || (taller?.imagen_url || "https://placehold.co/600x400?text=Taller"),
        herramientas: data.herramientas || [],
        campos_webhook: convertToObject(data.campos_webhook || [])
      };
      
      // MODO EDICIÓN: Actualizar taller existente
      if (taller?.id) {
        console.log("MODO EDICIÓN - Actualizando taller existente con ID:", taller.id);
        console.log("Datos a actualizar:", tallerData);
        
        const { data: updatedTaller, error } = await supabaseClient
          .from('talleres')
          .update(tallerData)
          .eq('id', taller.id)
          .select();
        
        if (error) {
          console.error("Error al actualizar el taller:", error);
          throw error;
        }
        
        console.log("Taller actualizado exitosamente:", updatedTaller);
        
        // Si hay fechas, actualizarlas
        if (fechas.length > 0 && taller.id) {
          await handleFechas(taller.id, fechas);
        }
        
        setSuccessMessage('Taller actualizado correctamente');
        setTimeout(() => {
          if (backofficeMode) {
            router.push('/backoffice/talleres');
          } else {
            router.push('/dashboard/talleres');
          }
        }, 1500);
      } 
      // MODO CREACIÓN: Crear nuevo taller
      else {
        // Obtener el siguiente ID disponible
        const nextId = await getNextId(supabaseClient, 'talleres');
        console.log("ID asignado para el nuevo taller:", nextId);
        
        // Añadir el ID a los datos
        const newTallerData = {
          id: nextId,
          ...tallerData
        };
        
        console.log("MODO CREACIÓN - Creando nuevo taller");
        console.log("Datos a insertar:", newTallerData);
        
        // Insertar el taller en la base de datos
        const { data: insertedTaller, error } = await supabaseClient
          .from('talleres')
          .insert([newTallerData])
          .select();
        
        if (error) {
          console.error("Error al crear el taller:", error);
          throw error;
        }
        
        console.log("Taller creado exitosamente:", insertedTaller);
        
        // Si hay fechas, guardarlas
        if (fechas.length > 0) {
          await handleFechas(nextId, fechas);
        }
        
        setSuccessMessage('Taller creado correctamente');
        setTimeout(() => {
          if (backofficeMode) {
            router.push('/backoffice/talleres');
          } else {
            router.push('/dashboard/talleres');
          }
        }, 1500);
      }
      
    } catch (error: any) {
      console.error("Error en onSubmit:", error);
      setError(`Error al ${taller ? 'actualizar' : 'crear'} el taller: ${error.message || 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Función auxiliar para manejar las fechas
  const handleFechas = async (tallerId: number, fechasList: Date[]) => {
    try {
      // Primero eliminar fechas existentes
      await supabaseClient
        .from('taller_fechas')
        .delete()
        .eq('taller_id', tallerId);
      
      // Luego insertar las nuevas fechas
      if (fechasList.length > 0) {
        const fechasData = fechasList.map(fecha => ({
          taller_id: tallerId,
          fecha: fecha.toISOString(),
        }));
        
        const { error: fechasError } = await supabaseClient
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
    setValue('campos_webhook', tags as any);
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
        const { data, error } = await supabaseClient
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
  }, [taller, supabaseClient]);

  useEffect(() => {
    if (taller) {
      // Inicializar campos_webhook
      const webhookFields = convertToKeyValuePairs(taller.campos_webhook);
      setWebhookFields(webhookFields);
      
      // Actualizar el valor en el formulario
      setValue('campos_webhook', Array.isArray(taller.campos_webhook) ? taller.campos_webhook : []);
    }
  }, [taller, setValue]);

  // Función para convertir campos_webhook a array
  const convertToObject = (data: any): string[] => {
    // Si es undefined o null, devolver array vacío
    if (!data) return [];
    
    // Si ya es un array, asegurarse de que todos los elementos sean strings
    if (Array.isArray(data)) {
      return data.map(item => String(item));
    } 
    
    // Si es un objeto, convertirlo a array de strings en formato "clave:valor"
    if (typeof data === 'object') {
      return Object.entries(data).map(([key, value]) => `${key}:${value}`);
    }
    
    // Si es un string, devolverlo en un array
    if (typeof data === 'string') {
      return [data];
    }
    
    // Por defecto, devolver array vacío
    return [];
  };

  // Función para convertir campos_webhook de array a formato para el componente
  const convertToKeyValuePairs = (data: any): { key: string; value: string }[] => {
    // Si es undefined o null, devolver array vacío
    if (!data) return [];
    
    // Si es un array, procesar cada elemento
    if (Array.isArray(data)) {
      return data.map(item => {
        // Si el elemento es un string, intentar dividirlo por ":"
        if (typeof item === 'string') {
          const parts = item.split(':');
          if (parts.length >= 2) {
            const [key, ...valueParts] = parts;
            return { 
              key: key.trim(), 
              value: valueParts.join(':').trim() 
            };
          }
          // Si no tiene ":", usar el string como clave y valor vacío
          return { key: item.trim(), value: '' };
        }
        
        // Si el elemento es un objeto, intentar extraer key y value
        if (typeof item === 'object' && item !== null) {
          if ('key' in item && 'value' in item) {
            return { 
              key: String(item.key).trim(), 
              value: String(item.value).trim() 
            };
          }
        }
        
        // Por defecto, convertir a string y usar como clave
        return { key: String(item).trim(), value: '' };
      }).filter(item => item.key !== ''); // Filtrar elementos sin clave
    } 
    
    // Si es un objeto, convertirlo a array de {key, value}
    if (typeof data === 'object' && data !== null) {
      return Object.entries(data).map(([key, value]) => ({
        key: key.trim(),
        value: String(value).trim()
      })).filter(item => item.key !== ''); // Filtrar elementos sin clave
    }
    
    // Si es un string, intentar usarlo como clave
    if (typeof data === 'string' && data.trim() !== '') {
      return [{ key: data.trim(), value: '' }];
    }
    
    // Por defecto, devolver array vacío
    return [];
  };

  // Estado para manejar los campos webhook en formato key-value
  const [webhookFields, setWebhookFields] = useState<{ key: string; value: string }[]>(
    convertToKeyValuePairs(taller?.campos_webhook)
  );

  // Función para actualizar campos_webhook en el formulario
  const handleWebhookFieldsChange = (fields: { key: string; value: string }[]) => {
    setWebhookFields(fields);
    
    // Convertir a array de strings para el formulario
    const webhookArray = fields
      .filter(({ key }) => key.trim() !== '') // Filtrar elementos sin clave
      .map(({ key, value }) => `${key.trim()}:${value.trim()}`);
    
    setValue('campos_webhook', webhookArray);
  };

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <FormLabel htmlFor="capacidad" required>Capacidad</FormLabel>
            <Input
              id="capacidad"
              type="number"
              placeholder="Número de participantes"
              {...register('capacidad')}
              className={`bg-white text-slate-900 ${errors.capacidad ? 'border-red-500' : 'border-slate-300'}`}
              onChange={(e) => {
                // Limitar a 9 dígitos para evitar desbordamiento de INTEGER
                if (e.target.value.length > 9) {
                  e.target.value = e.target.value.slice(0, 9);
                }
                // Actualizar el valor en el formulario
                setValue('capacidad', e.target.value);
              }}
            />
            {errors.capacidad && (
              <FormError>{typeof errors.capacidad.message === 'string' ? errors.capacidad.message : 'Error en capacidad'}</FormError>
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
              onChange={(e) => {
                // Limitar a 9 dígitos para evitar desbordamiento de INTEGER
                if (e.target.value.length > 9) {
                  e.target.value = e.target.value.slice(0, 9);
                }
                // Actualizar el valor en el formulario
                setValue('precio', e.target.value);
              }}
            />
            {errors.precio && (
              <FormError>{typeof errors.precio.message === 'string' ? errors.precio.message : 'Error en precio'}</FormError>
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

        <div>
          <FormLabel htmlFor="fecha">Fecha del taller</FormLabel>
          <Input
            id="fecha"
            type="datetime-local"
            {...register('fecha')}
            className={`bg-white text-slate-900 ${errors.fecha ? 'border-red-500' : 'border-slate-300'}`}
          />
          {errors.fecha && (
            <FormError>{errors.fecha.message}</FormError>
          )}
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
                className="mt-2"
              />
            )}
          />
          {errors.herramientas && (
            <FormError>{typeof errors.herramientas.message === 'string' ? errors.herramientas.message : 'Error en herramientas'}</FormError>
          )}
        </div>

        <div>
          <FormLabel>Campos para webhook</FormLabel>
          <KeyValueInput
            value={webhookFields}
            onChange={handleWebhookFieldsChange}
            placeholder="Añadir campo y valor"
            className={errors.campos_webhook ? 'border-red-500' : 'border-slate-300'}
          />
          {errors.campos_webhook && (
            <FormError>{typeof errors.campos_webhook.message === 'string' ? errors.campos_webhook.message : 'Error en campos webhook'}</FormError>
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