'use client';

import { useState, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Taller, TallerConHerramientas } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface TallerRegistroProps {
  taller: Taller | TallerConHerramientas;
  referidoPor?: string;
}

// Esquema para talleres pregrabados
const baseSchema = z.object({
  nombre: z.string().min(3, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  telefono: z.string()
    .min(5, 'Teléfono inválido')
    .refine(
      (value) => {
        console.log('Validando teléfono:', value);
        
        // Verificar si tiene código de país
        const hasCountryCode = value.match(/^\+\d+/);
        console.log('¿Tiene código de país?', !!hasCountryCode);
        
        // Contar dígitos en el número
        const digitCount = value.replace(/\D/g, '').length;
        console.log('Cantidad de dígitos:', digitCount);
        
        // Si tiene código de país, debe tener al menos 9 caracteres en total (código + número)
        if (hasCountryCode) {
          const isValid = digitCount >= 9; // Código de país (2 dígitos) + número (7 dígitos)
          console.log('Longitud con código:', value.length, 'Dígitos:', digitCount, 'Válido:', isValid);
          return isValid;
        }
        
        // Si no tiene código de país, debe tener al menos 7 dígitos
        const isValid = digitCount >= 7;
        console.log('Cantidad de dígitos sin código:', digitCount, 'Válido:', isValid);
        return isValid;
      },
      {
        message: 'El número debe tener al menos 7 dígitos'
      }
    ),
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

  // Corregir la parte que genera fechasDisponibles
  const fechasDisponibles = useMemo(() => {
    const fechas = [];
    
    // Usar la fecha general del taller
    if (taller.fecha) {
      fechas.push({
        id: taller.fecha,
        tipo: taller.tipo === 'vivo' ? 'En vivo' : 'Live Build',
        fecha: new Date(taller.fecha)
      });
    }
    
    // Si hay fechas adicionales en el array de fechas
    if (taller.fechas && Array.isArray(taller.fechas)) {
      taller.fechas.forEach(fechaObj => {
        const fecha = typeof fechaObj === 'string' 
          ? { id: fechaObj, tipo: 'Sesión adicional', fecha: new Date(fechaObj) }
          : { id: fechaObj.fecha, tipo: 'Sesión adicional', fecha: new Date(fechaObj.fecha) };
        
        fechas.push(fecha);
      });
    }
    
    return fechas;
  }, [taller]);

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
      console.log('Datos a enviar:', data);
      
      // Validar el formato del teléfono
      let telefono = data.telefono;
      console.log('Teléfono antes de enviar:', telefono);
      
      // Verificar si tiene código de país
      if (!telefono.match(/^\+\d+/)) {
        console.log('Teléfono sin código de país, agregando +57');
        telefono = '+57 ' + telefono;
      }
      
      // Limpiar el teléfono (eliminar espacios, guiones, etc.)
      telefono = telefono.trim();
      
      const payload = {
        name: data.nombre,
        email: data.email,
        phone: telefono,
        tallerId: taller.id,
        referidoPor: referidoPor,
      };
      console.log('Payload completo:', payload);
      
      const apiUrl = '/api/register';
      console.log('URL de la API:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Respuesta del servidor - Status:', response.status);
      
      const contentType = response.headers.get('content-type');
      console.log('Tipo de contenido:', contentType);
      
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        console.error('Respuesta no JSON recibida:', textResponse.substring(0, 200) + '...');
        throw new Error('El servidor no devolvió JSON válido. Posible error en el servidor.');
      }

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Error del servidor:', responseData);
        throw new Error(responseData.error || 'Error al registrarse');
      }

      console.log('Registro exitoso:', responseData);
      setSubmitSuccess(true);
    } catch (error: any) {
      console.error('Error en el proceso de registro:', error);
      setSubmitError(error.message || 'Error al registrarse. Intenta de nuevo más tarde.');
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
          <div className="bg-[#2a7c60] bg-opacity-10 text-[#2a7c60] p-4 rounded-md mb-4">
            <p className="font-medium">¡Registro exitoso!</p>
            <p className="text-sm mt-1">Gracias por registrarte. Te contactaremos pronto con más detalles.</p>
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
              <div className="bg-[#fffdf9] p-4 rounded-md mb-4">
                <p className="text-center font-medium">
                  {taller.precio && taller.precio > 0 
                    ? `Precio: COP $${taller.precio.toLocaleString('es-CO')} / USD $${precioUSD}` 
                    : 'Taller gratuito'}
                </p>
              </div>

              {/* Selección de fecha para talleres en vivo */}
              {fechasDisponibles.length > 0 && (
                <div className="bg-[#fffdf9] p-4 rounded-md">
                  <h4 className="font-medium text-gray-700 mb-3">Selecciona una fecha</h4>
                  
                  {fechasDisponibles.map((fechaObj) => (
                    <div key={fechaObj.id} className="mb-2 last:mb-0">
                      <label className="flex items-start">
                        <input
                          type="radio"
                          value={fechaObj.id}
                          {...vivoForm.register('fecha_seleccionada')}
                          className="mt-1 mr-2"
                        />
                        <span>{fechaObj.tipo} - {format(fechaObj.fecha, 'EEEE d MMMM, h:mm a', { locale: es })}</span>
                      </label>
                    </div>
                  ))}
                  
                  {vivoForm.formState.errors.fecha_seleccionada && (
                    <p className="mt-1 text-xs text-red-500">{vivoForm.formState.errors.fecha_seleccionada.message}</p>
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f]"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f]"
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
                <div className="flex">
                  <div className="flex-shrink-0 w-24">
                    <select
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f] bg-gray-50"
                      defaultValue="+57"
                      onChange={(e) => {
                        console.log('Código de país cambiado a:', e.target.value);
                        const value = vivoForm.getValues('telefono') || '';
                        console.log('Valor actual del teléfono:', value);
                        
                        // Eliminar cualquier código de país existente
                        const phoneWithoutCode = value.replace(/^\+\d+\s*/, '');
                        console.log('Teléfono sin código:', phoneWithoutCode);
                        
                        // Agregar el nuevo código de país
                        const newValue = `${e.target.value} ${phoneWithoutCode}`;
                        console.log('Nuevo valor del teléfono:', newValue);
                        
                        vivoForm.setValue('telefono', newValue);
                      }}
                    >
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+51">🇵🇪 +51</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    {...vivoForm.register('telefono')}
                    className="flex-grow p-2 border border-gray-300 rounded-r-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f]"
                    placeholder="300 123 4567"
                    defaultValue="+57 "
                    onChange={(e) => {
                      // Obtener el valor actual
                      let value = e.target.value;
                      console.log('Valor del input:', value);
                      
                      // Si el valor no comienza con un código de país, agregarlo
                      if (!value.match(/^\+\d+/)) {
                        // Obtener el código de país del select
                        const selectElement = e.target.parentNode?.querySelector('select') as HTMLSelectElement;
                        const code = selectElement ? selectElement.value : '+57';
                        console.log('Código de país seleccionado:', code);
                        value = `${code} ${value.replace(/^\+\d+\s*/, '')}`;
                        console.log('Valor con código de país:', value);
                      }
                      
                      // Actualizar el valor
                      vivoForm.setValue('telefono', value);
                    }}
                  />
                </div>
                {vivoForm.formState.errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{vivoForm.formState.errors.telefono.message}</p>
                )}
              </div>

              {/* Información adicional para talleres en vivo */}
              <div className="bg-[#fffdf9] p-4 rounded-md">
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
                  <p className="font-medium">Error al registrarse:</p>
                  <p>{submitError}</p>
                  <p className="text-sm mt-2">
                    Si el problema persiste, por favor contacta a soporte en <a href="mailto:soporte@azteclab.co" className="underline">soporte@azteclab.co</a>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2a7c60] hover:bg-[#1e5a46] text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
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
              <div className="bg-[#fffdf9] p-4 rounded-md mb-4">
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f]"
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f]"
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
                <div className="flex">
                  <div className="flex-shrink-0 w-24">
                    <select
                      className="w-full p-2 border border-gray-300 rounded-l-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f] bg-gray-50"
                      defaultValue="+57"
                      onChange={(e) => {
                        console.log('Código de país cambiado a (pregrabado):', e.target.value);
                        const value = pregrabadoForm.getValues('telefono') || '';
                        console.log('Valor actual del teléfono (pregrabado):', value);
                        
                        // Eliminar cualquier código de país existente
                        const phoneWithoutCode = value.replace(/^\+\d+\s*/, '');
                        console.log('Teléfono sin código (pregrabado):', phoneWithoutCode);
                        
                        // Agregar el nuevo código de país
                        const newValue = `${e.target.value} ${phoneWithoutCode}`;
                        console.log('Nuevo valor del teléfono (pregrabado):', newValue);
                        
                        pregrabadoForm.setValue('telefono', newValue);
                      }}
                    >
                      <option value="+57">🇨🇴 +57</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+52">🇲🇽 +52</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+51">🇵🇪 +51</option>
                      <option value="+56">🇨🇱 +56</option>
                      <option value="+54">🇦🇷 +54</option>
                    </select>
                  </div>
                  <input
                    type="tel"
                    {...pregrabadoForm.register('telefono')}
                    className="flex-grow p-2 border border-gray-300 rounded-r-md focus:ring-[#1b5e4f] focus:border-[#1b5e4f]"
                    placeholder="300 123 4567"
                    defaultValue="+57 "
                    onChange={(e) => {
                      // Obtener el valor actual
                      let value = e.target.value;
                      console.log('Valor del input (pregrabado):', value);
                      
                      // Si el valor no comienza con un código de país, agregarlo
                      if (!value.match(/^\+\d+/)) {
                        // Obtener el código de país del select
                        const selectElement = e.target.parentNode?.querySelector('select') as HTMLSelectElement;
                        const code = selectElement ? selectElement.value : '+57';
                        console.log('Código de país seleccionado (pregrabado):', code);
                        value = `${code} ${value.replace(/^\+\d+\s*/, '')}`;
                        console.log('Valor con código de país (pregrabado):', value);
                      }
                      
                      // Actualizar el valor
                      pregrabadoForm.setValue('telefono', value);
                    }}
                  />
                </div>
                {pregrabadoForm.formState.errors.telefono && (
                  <p className="mt-1 text-sm text-red-600">{pregrabadoForm.formState.errors.telefono.message}</p>
                )}
              </div>

              {/* Información adicional para talleres pregrabados */}
              <div className="bg-[#fffdf9] p-4 rounded-md">
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
                  <p className="font-medium">Error al registrarse:</p>
                  <p>{submitError}</p>
                  <p className="text-sm mt-2">
                    Si el problema persiste, por favor contacta a soporte en <a href="mailto:soporte@azteclab.co" className="underline">soporte@azteclab.co</a>
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#2a7c60] hover:bg-[#1e5a46] text-white font-medium py-2 px-4 rounded-md transition duration-150 ease-in-out disabled:opacity-50"
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