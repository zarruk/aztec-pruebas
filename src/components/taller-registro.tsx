'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Taller } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TallerRegistroProps {
  taller: Taller;
  referidoPor?: string;
}

// Esquema para talleres pregrabados
const baseSchema = z.object({
  nombre: z.string().min(3, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string().min(10, 'Teléfono inválido'),
});

// Esquema para talleres en vivo
const tallerVivoSchema = baseSchema.extend({
  fecha_seleccionada: z.string().min(1, 'Selecciona una fecha'),
});

// Tipos inferidos de los esquemas
type FormDataBase = z.infer<typeof baseSchema>;
type FormDataVivo = z.infer<typeof tallerVivoSchema>;

export function TallerRegistro({ taller, referidoPor }: TallerRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Determinar si es un taller en vivo
  const esVivoOLiveBuild = taller.tipo === 'vivo' || taller.tipo === 'live_build';

  // Determinar fechas disponibles
  const fechasDisponibles = [];
  if (taller.fecha_vivo) {
    fechasDisponibles.push({
      id: 'fecha_vivo',
      fecha: new Date(taller.fecha_vivo),
      tipo: 'Taller en vivo',
    });
  }
  if (taller.fecha_live_build) {
    fechasDisponibles.push({
      id: 'fecha_live_build',
      fecha: new Date(taller.fecha_live_build),
      tipo: 'Live build',
    });
  }

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
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          taller_id: taller.id,
          referido_por: referidoPor,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrarse');
      }

      setSubmitSuccess(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Error al registrarse');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular precio en USD (1 USD = 4000 COP)
  const precioUSD = taller.precio ? Math.round((taller.precio / 4000) * 10) / 10 : 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold mb-4">
        {submitSuccess ? '¡Registro exitoso!' : 'Regístrate ahora'}
      </h3>

      {submitSuccess ? (
        <div className="text-center py-4">
          <div className="bg-green-100 text-green-800 p-4 rounded-md mb-4">
            <p>Tu registro ha sido completado con éxito.</p>
            <p className="mt-2">Te hemos enviado un correo con los detalles.</p>
          </div>
          <p className="text-gray-600 mt-4">
            {taller.tipo === 'pregrabado' 
              ? 'Recibirás acceso al taller pregrabado en tu correo electrónico.' 
              : 'Te enviaremos un recordatorio antes del taller.'}
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
                    <option value="">Selecciona una fecha</option>
                    {fechasDisponibles.map((fechaObj) => (
                      <option key={fechaObj.id} value={fechaObj.id}>
                        {fechaObj.tipo} - {format(fechaObj.fecha, 'EEEE d MMMM, h:mm a', { locale: es })}
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
                  <li>Enlace para unirte al taller en vivo</li>
                  <li>Recordatorio 24 horas antes</li>
                  <li>Grabación del taller después del evento</li>
                  <li>Certificado de participación</li>
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