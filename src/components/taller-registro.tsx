'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Taller } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Esquema de validación para el formulario de registro
const registroSchema = z.object({
  nombre: z.string().min(3, 'El nombre es requerido (mínimo 3 caracteres)'),
  email: z.string().email('Correo electrónico inválido'),
  telefono: z.string().min(8, 'Teléfono inválido (mínimo 8 caracteres)'),
  fecha_seleccionada: z.string().optional(),
});

type RegistroFormValues = z.infer<typeof registroSchema>;

interface TallerRegistroProps {
  taller: Taller;
}

export function TallerRegistro({ taller }: TallerRegistroProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Determinar si el taller tiene fechas disponibles
  const tieneFechasDisponibles = (taller.tipo === 'vivo' || taller.tipo === 'live_build') && (taller.fecha_vivo || taller.fecha_live_build);
  
  // Crear un array de fechas disponibles
  const fechasDisponibles = [];
  if (taller.fecha_vivo) {
    fechasDisponibles.push({
      id: 'fecha_vivo',
      fecha: new Date(taller.fecha_vivo),
      label: `Taller en vivo: ${format(new Date(taller.fecha_vivo), 'PPP', { locale: es })}`
    });
  }
  if (taller.fecha_live_build) {
    fechasDisponibles.push({
      id: 'fecha_live_build',
      fecha: new Date(taller.fecha_live_build),
      label: `Live build: ${format(new Date(taller.fecha_live_build), 'PPP', { locale: es })}`
    });
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegistroFormValues>({
    resolver: zodResolver(registroSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      fecha_seleccionada: fechasDisponibles.length > 0 ? fechasDisponibles[0].id : undefined,
    },
  });

  const fechaSeleccionada = watch('fecha_seleccionada');

  // Función para enviar los datos a la API de registro
  const enviarRegistro = async (data: RegistroFormValues) => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Preparar los datos para la API
      const registroData = {
        name: data.nombre,
        email: data.email,
        phone: data.telefono,
        tallerId: taller.id,
        fecha_seleccionada: data.fecha_seleccionada
      };

      console.log('Enviando datos a la API de registro:', registroData);

      // Enviar los datos a la API de registro
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registroData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(`Error al registrar: ${responseData.error || response.statusText}`);
      }

      console.log('Registro completado correctamente:', responseData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error('Error al registrar:', error);
      setSubmitError(error instanceof Error ? error.message : 'Error al procesar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Si el registro fue exitoso, mostrar mensaje de éxito
  if (submitSuccess) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-6 text-center">
        <h3 className="text-xl font-semibold text-emerald-700 mb-2">¡Registro exitoso!</h3>
        <p className="text-emerald-600 mb-4">
          Gracias por registrarte en nuestro taller. Te hemos enviado un correo con los detalles.
        </p>
        <Button 
          onClick={() => setSubmitSuccess(false)}
          variant="outline"
        >
          Registrar otra persona
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-semibold mb-4">
        {(taller.tipo === 'vivo' || taller.tipo === 'live_build')
          ? 'Reserva tu lugar en este taller' 
          : 'Compra este taller pregrabado'}
      </h3>
      
      <form onSubmit={handleSubmit(enviarRegistro)} className="space-y-4">
        {/* Selector de fechas para talleres live */}
        {tieneFechasDisponibles && fechasDisponibles.length > 0 && (
          <div className="space-y-2">
            <label htmlFor="fecha_seleccionada" className="block text-sm font-medium">
              Selecciona una fecha
            </label>
            <select
              id="fecha_seleccionada"
              value={fechaSeleccionada}
              onChange={(e) => setValue('fecha_seleccionada', e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            >
              {fechasDisponibles.map((fecha) => (
                <option key={fecha.id} value={fecha.id}>
                  {fecha.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {/* Campos de registro */}
        <div className="space-y-2">
          <label htmlFor="nombre" className="block text-sm font-medium">
            Nombre completo
          </label>
          <Input
            id="nombre"
            {...register('nombre')}
            placeholder="Tu nombre completo"
            className={errors.nombre ? 'border-red-500' : ''}
          />
          {errors.nombre && (
            <p className="text-red-500 text-sm">{errors.nombre.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium">
            Correo electrónico
          </label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="tu@email.com"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        
        <div className="space-y-2">
          <label htmlFor="telefono" className="block text-sm font-medium">
            Teléfono
          </label>
          <Input
            id="telefono"
            {...register('telefono')}
            placeholder="Tu número de teléfono"
            className={errors.telefono ? 'border-red-500' : ''}
          />
          {errors.telefono && (
            <p className="text-red-500 text-sm">{errors.telefono.message}</p>
          )}
        </div>
        
        {/* Mensaje de error */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600">
            {submitError}
          </div>
        )}
        
        {/* Botón de envío */}
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="mr-2 inline-block animate-spin">⟳</span>
              Procesando...
            </>
          ) : (
            (taller.tipo === 'vivo' || taller.tipo === 'live_build') ? 'Reservar mi lugar' : 'Comprar taller'
          )}
        </Button>
        
        {/* Información de precio */}
        <p className="text-sm text-gray-500 text-center">
          {taller.precio && taller.precio > 0 
            ? `Precio: $${taller.precio} MXN` 
            : 'Este taller es gratuito'}
        </p>
      </form>
    </div>
  );
} 