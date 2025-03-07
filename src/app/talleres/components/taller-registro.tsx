"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Taller } from '@/lib/types';
import { format } from 'date-fns';
import { z } from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Esquema base para todos los tipos de taller
const baseSchema = z.object({
  nombre: z.string().min(1, { message: 'El nombre es requerido' }),
  email: z.string().email({ message: 'Email inválido' }),
  telefono: z.string().min(1, { message: 'El teléfono es requerido' }),
});

// Tipos para los datos del formulario
type FormDataBase = z.infer<typeof baseSchema>;

export function TallerRegistro({ taller, referidoPor }: { taller: Taller, referidoPor?: string }) {
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Convertir precio a USD (aproximado)
  const precioUSD = Math.round(taller.precio / 4000);
  
  // Formulario para todos los talleres
  const form = useForm<FormDataBase>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
    }
  });

  const onSubmit = async (data: FormDataBase) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Preparar datos para insertar
      const registroData: any = {
        taller_id: taller.id,
        nombre: data.nombre,
        email: data.email,
        telefono: data.telefono,
        referido_por: referidoPor || null,
      };
      
      console.log('Datos a insertar:', registroData); // Para depuración
      
      // Insertar en la base de datos
      const { error } = await supabase
        .from('registros_talleres')
        .insert([registroData]);
      
      if (error) {
        console.error('Error al insertar:', error); // Para depuración
        throw error;
      }
      
      // Mostrar mensaje de éxito
      setSuccess(true);
    } catch (error: any) {
      console.error('Error completo:', error); // Para depuración
      setSubmitError(error.message || 'Ocurrió un error al procesar tu registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Regístrate ahora</h2>
      
      {success ? (
        <div className="bg-green-50 text-green-800 p-4 rounded-md">
          <p className="font-medium">¡Registro exitoso!</p>
          <p className="mt-2">Te hemos enviado un correo con los detalles para acceder al taller.</p>
        </div>
      ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Precio del taller */}
          <div className="bg-[#f8f5f0] p-4 rounded-md mb-4">
            <p className="text-center font-medium">
              {taller.precio && taller.precio > 0 
                ? `Precio: COP $${taller.precio.toLocaleString('es-CO')} / USD $${precioUSD}` 
                : 'Taller gratuito'}
            </p>
          </div>

          {/* Fecha del taller */}
          <div className="bg-[#f0f8f5] p-4 rounded-md mb-4">
            <p className="text-center font-medium">
              Fecha del taller: {taller.fecha ? format(new Date(taller.fecha), 'dd/MM/yyyy HH:mm') : 'Fecha por confirmar'}
            </p>
          </div>

          {/* Campos comunes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              {...form.register('nombre')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="Tu nombre completo"
            />
            {form.formState.errors.nombre && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              {...form.register('email')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="tu@email.com"
            />
            {form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono
            </label>
            <input
              type="tel"
              {...form.register('telefono')}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="+57 300 123 4567"
            />
            {form.formState.errors.telefono && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.telefono.message}</p>
            )}
          </div>

          {submitError && (
            <div className="bg-red-50 text-red-800 p-3 rounded-md">
              <p>{submitError}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Procesando...' : 'Registrarme ahora'}
          </button>
        </form>
      )}
    </div>
  );
} 