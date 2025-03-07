"use client";

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
import { toast } from 'react-hot-toast';
import ImageUpload from '@/components/ui/image-upload';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Herramienta } from "@/lib/types";

type FormValues = z.infer<typeof tallerSchema>;

interface TallerFormProps {
  taller?: Taller;
  onError?: (error: string | null) => void;
  herramientas: Herramienta[];
}

export function TallerForm({ taller, onError, herramientas }: TallerFormProps) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(taller?.imagen_url || '');
  
  console.log("TallerForm recibió taller para editar:", taller);

  // Inicializar valores por defecto
  const defaultValues = {
    nombre: taller?.nombre || '',
    descripcion: taller?.descripcion || '',
    video_url: taller?.video_url || '',
    tipo: taller?.tipo || 'pregrabado',
    fecha: taller?.fecha || '',
    precio: taller?.precio?.toString() || '0',
    capacidad: taller?.capacidad?.toString() || '0',
    herramientas: taller?.herramientas || [],
  };
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    setValue,
    getValues,
  } = useForm<FormValues>({
    resolver: zodResolver(tallerSchema),
    defaultValues: defaultValues,
  });

  // Manejar subida de imagen
  const handleImageUpload = (url: string) => {
    console.log("Imagen subida:", url);
    setImageUrl(url);
    setValue('imagen_url', url);
  };

  // Función simplificada para crear/actualizar taller
  const onSubmit = async (data: FormValues) => {
    console.log("Función onSubmit llamada");
    console.log("Datos del formulario:", data);
    
    // Validación para todos los tipos de taller
    if (!data.fecha) {
      setError("Debes seleccionar una fecha para el taller");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      // Obtener el ID máximo actual para asignar un nuevo ID consecutivo
      let nextId = taller?.id;
      
      if (!nextId) {
        console.log("Obteniendo ID máximo actual...");
        const { data: maxIdData, error: maxIdError } = await supabase
          .from('talleres')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);
        
        if (maxIdError) {
          console.error("ERROR al obtener ID máximo:", maxIdError.message);
          throw maxIdError;
        }
        
        // Calcular el siguiente ID
        nextId = 1;
        if (maxIdData && maxIdData.length > 0) {
          nextId = maxIdData[0].id + 1;
        }
        
        console.log("Próximo ID a usar:", nextId);
      }

      // Formatear la fecha si existe
      let fechaFormateada = null;
      if (data.fecha) {
        try {
          // Asumimos que la fecha viene en formato YYYY-MM-DD
          const fechaCompleta = new Date(`${data.fecha}T18:00:00`); // Hora por defecto: 18:00
          fechaFormateada = fechaCompleta.toISOString();
          console.log("Fecha formateada:", fechaFormateada);
        } catch (error) {
          console.error("Error al formatear fecha:", error);
          throw new Error("Formato de fecha inválido");
        }
      }
      
      // Datos del taller
      const tallerData = {
        id: nextId, // Asignar explícitamente el ID
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo,
        video_url: data.video_url || "",
        capacidad: data.capacidad ? parseInt(data.capacidad) : 20,
        precio: data.precio ? parseFloat(data.precio) : 99000,
        herramientas: data.herramientas || [],
        imagen_url: data.imagen_url,
        fecha: fechaFormateada
      };
      
      console.log("Enviando datos:", JSON.stringify(tallerData));
      
      let tallerResponse;
      
      if (taller?.id) {
        // Actualizar taller existente
        tallerResponse = await supabase
          .from("talleres")
          .update(tallerData)
          .eq("id", taller.id)
          .select()
          .single();
      } else {
        // Insertar nuevo taller con ID explícito
        // Primero, intentar con un INSERT directo
        tallerResponse = await supabase
          .from("talleres")
          .insert(tallerData)
          .select()
          .single();
      }
      
      if (tallerResponse.error) {
        console.error("ERROR al guardar taller:", tallerResponse.error.message);
        throw tallerResponse.error;
      }
      
      console.log("Taller guardado exitosamente:", JSON.stringify(tallerResponse.data));

      // Redireccionar al dashboard de talleres
      toast.success('Taller guardado correctamente');
      router.push('/dashboard/talleres');
    } catch (error: any) {
      console.error("Error al guardar taller:", error);
      const errorMessage = error.message || "Error al guardar el taller";
      setError(errorMessage);
      if (onError) {
        onError(errorMessage);
      }
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        <div>
          <FormLabel htmlFor="nombre">Nombre del taller</FormLabel>
          <Input
            id="nombre"
            placeholder="Nombre del taller"
            {...register('nombre')}
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && <FormError>{errors.nombre.message}</FormError>}
        </div>
        
        <div>
          <FormLabel htmlFor="descripcion">Descripción</FormLabel>
          <Textarea
            id="descripcion"
            placeholder="Descripción del taller"
            {...register('descripcion')}
            className={errors.descripcion ? 'border-red-500' : ''}
            rows={4}
          />
          {errors.descripcion && <FormError>{errors.descripcion.message}</FormError>}
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
                className="flex flex-col space-y-1 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pregrabado" id="pregrabado" />
                  <label htmlFor="pregrabado" className="cursor-pointer">Pre-grabado</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="vivo" id="vivo" />
                  <label htmlFor="vivo" className="cursor-pointer">En vivo</label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="live_build" id="live_build" />
                  <label htmlFor="live_build" className="cursor-pointer">Live Build</label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.tipo && <FormError>{errors.tipo.message}</FormError>}
        </div>
        
        <div>
          <FormLabel htmlFor="fecha">Fecha del taller</FormLabel>
          <Input
            id="fecha"
            type="date"
            {...register('fecha')}
            className={errors.fecha ? 'border-red-500' : ''}
          />
          {errors.fecha && <FormError>{errors.fecha.message}</FormError>}
        </div>
        
        <div>
          <FormLabel htmlFor="video_url">URL del video</FormLabel>
          <Input
            id="video_url"
            placeholder="https://example.com/video"
            {...register('video_url')}
            className={errors.video_url ? 'border-red-500' : ''}
          />
          {errors.video_url && <FormError>{errors.video_url.message}</FormError>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <FormLabel htmlFor="capacidad">Capacidad</FormLabel>
            <Input
              id="capacidad"
              type="number"
              placeholder="20"
              {...register('capacidad')}
              className={errors.capacidad ? 'border-red-500' : ''}
            />
            {errors.capacidad && <FormError>{errors.capacidad.message}</FormError>}
          </div>
          
          <div>
            <FormLabel htmlFor="precio">Precio (COP)</FormLabel>
            <Input
              id="precio"
              type="number"
              placeholder="99000"
              {...register('precio')}
              className={errors.precio ? 'border-red-500' : ''}
            />
            {errors.precio && <FormError>{errors.precio.message}</FormError>}
          </div>
        </div>
        
        <div>
          <FormLabel>Imagen del taller</FormLabel>
          <div className="mt-2">
            <ImageUpload
              onImageUpload={handleImageUpload}
              initialImageUrl={imageUrl}
            />
          </div>
        </div>
        
        <div>
          <FormLabel>Herramientas necesarias</FormLabel>
          <div className="mt-2">
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
          </div>
        </div>
      </div>
      
      <div className="flex justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/talleres')}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSubmitting ? 'Guardando...' : taller?.id ? 'Actualizar taller' : 'Crear taller'}
        </Button>
      </div>
    </form>
  );
} 