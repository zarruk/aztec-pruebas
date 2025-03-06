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

// Esquema para talleres en vivo (incluye fecha)
const tallerVivoSchema = baseSchema.extend({
  fecha_seleccionada: z.string().min(1, { message: 'Debes seleccionar una fecha' }),
});

// Tipos para los datos del formulario
type FormDataBase = z.infer<typeof baseSchema>;
type FormDataVivo = z.infer<typeof tallerVivoSchema>;

export function TallerRegistro({ taller, referidoPor }: { taller: Taller, referidoPor?: string }) {
  const supabase = createClientComponentClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Determinar si es un taller en vivo o livebuild
  const esVivoOLiveBuild = taller.tipo === 'vivo' || taller.tipo === 'livebuild';
  
  // Convertir precio a USD (aproximado)
  const precioUSD = Math.round(taller.precio / 4000);
  
  // Formatear fechas disponibles para talleres en vivo
  const fechasDisponibles = taller.fechas?.map((fecha, index) => {
    const fechaObj = new Date(fecha.fecha);
    return {
      id: `${index}`,
      label: `${format(fechaObj, 'dd/MM/yyyy')} a las ${fecha.hora}`
    };
  }) || [];

  // Formulario para talleres en vivo
  const vivoForm = useForm<FormDataVivo>({
    resolver: zodResolver(tallerVivoSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      fecha_seleccionada: fechasDisponibles.length > 0 ? fechasDisponibles[0].id : '',
    }
  });

  // Formulario para talleres pregrabados
  const pregrabadoForm = useForm<FormDataBase>({
    resolver: zodResolver(baseSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
    }
  });

  const onSubmit = async (data: FormDataBase | FormDataVivo) => {
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
      
      // Agregar fecha seleccionada si es un taller en vivo
      if (esVivoOLiveBuild && 'fecha_seleccionada' in data) {
        const fechaIndex = parseInt(data.fecha_seleccionada);
        if (taller.fechas && taller.fechas[fechaIndex]) {
          // Guardar la información de la fecha como un string JSON
          registroData.fecha_seleccionada = JSON.stringify({
            fecha: taller.fechas[fechaIndex].fecha,
            hora: taller.fechas[fechaIndex].hora
          });
        }
      }
      
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
          <p className="mt-2">
            {esVivoOLiveBuild 
              ? 'Te hemos enviado un correo con los detalles para acceder al taller en vivo.' 
              : 'Te hemos enviado un correo con los detalles para acceder al taller pregrabado.'}
          </p>
        </div>
      ) : (
        <>
          {esVivoOLiveBuild ? (
            <form onSubmit={vivoForm.handleSubmit(onSubmit)} className="space-y-4">
              {/* Precio del taller */}
              <div className="bg-[#f8f5f0] p-4 rounded-md mb-4">
                <p className="text-center font-medium">
                  {taller.precio && taller.precio > 0 
                    ? `Precio: COP $${taller.precio.toLocaleString('es-CO')} / USD $${precioUSD}` 
                    : 'Taller gratuito'}
                </p>
              </div>

              {/* Selección de fecha para talleres en vivo */}
              {fechasDisponibles.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Selecciona una fecha
                  </label>
                  <select
                    {...vivoForm.register('fecha_seleccionada')}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {fechasDisponibles.map((fecha) => (
                      <option key={fecha.id} value={fecha.id}>
                        {fecha.label}
                      </option>
                    ))}
                  </select>
                  {vivoForm.formState.errors.fecha_seleccionada && (
                    <p className="mt-1 text-sm text-red-600">
                      {vivoForm.formState.errors.fecha_seleccionada.message}
                    </p>
                  )}
                </div>
              )}

              {/* Campos comunes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  {...vivoForm.register('nombre')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tu nombre completo"
                />
                {vivoForm.formState.errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{vivoForm.formState.errors.nombre.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...vivoForm.register('email')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="tu@email.com"
                />
                {vivoForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{vivoForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  {...vivoForm.register('telefono')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+57 300 123 4567"
                />
                {vivoForm.formState.errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{vivoForm.formState.errors.telefono.message}</p>
                )}
              </div>

              {/* Información adicional para talleres en vivo */}
              <div className="bg-[#f8f5f0] p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  Al registrarte recibirás:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Enlace para acceder al taller en vivo</li>
                  <li>Recordatorio 24 horas antes</li>
                  <li>Material complementario</li>
                </ul>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md">
                  <p>{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : 'Registrarme ahora'}
              </button>

              {referidoPor && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Referido por: {referidoPor}
                </p>
              )}
            </form>
          ) : (
            <form onSubmit={pregrabadoForm.handleSubmit(onSubmit)} className="space-y-4">
              {/* Precio del taller */}
              <div className="bg-[#f8f5f0] p-4 rounded-md mb-4">
                <p className="text-center font-medium">
                  {taller.precio && taller.precio > 0 
                    ? `Precio: COP $${taller.precio.toLocaleString('es-CO')} / USD $${precioUSD}` 
                    : 'Taller gratuito'}
                </p>
              </div>

              {/* Campos comunes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  {...pregrabadoForm.register('nombre')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Tu nombre completo"
                />
                {pregrabadoForm.formState.errors.nombre && (
                  <p className="mt-1 text-sm text-red-600">{pregrabadoForm.formState.errors.nombre.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  {...pregrabadoForm.register('email')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="tu@email.com"
                />
                {pregrabadoForm.formState.errors.email && (
                  <p className="mt-1 text-sm text-red-600">{pregrabadoForm.formState.errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  {...pregrabadoForm.register('telefono')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="+57 300 123 4567"
                />
                {pregrabadoForm.formState.errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{pregrabadoForm.formState.errors.telefono.message}</p>
                )}
              </div>

              {/* Información adicional para talleres pregrabados */}
              <div className="bg-[#f8f5f0] p-4 rounded-md">
                <p className="text-sm text-gray-600 mb-2">
                  Al registrarte recibirás:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Acceso inmediato al taller pregrabado</li>
                  <li>Material complementario</li>
                  <li>Soporte por correo electrónico</li>
                </ul>
              </div>

              {submitError && (
                <div className="bg-red-50 text-red-800 p-3 rounded-md">
                  <p>{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
              >
                {isSubmitting ? 'Procesando...' : 'Registrarme ahora'}
              </button>

              {referidoPor && (
                <p className="text-xs text-gray-500 text-center mt-2">
                  Referido por: {referidoPor}
                </p>
              )}
            </form>
          )}
        </>
      )}
    </div>
  );
} 