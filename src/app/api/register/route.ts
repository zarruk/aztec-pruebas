import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { safeInteger } from '@/lib/utils';

// Inicializar cliente de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Faltan variables de entorno de Supabase');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// URL del webhook principal
const WEBHOOK_URL = 'https://aztec.app.n8n.cloud/webhook/a466287a-5bad-45a2-a2fa-dd768a6319bf';
// URL de webhook de respaldo para depuración (opcional)
// const DEBUG_WEBHOOK_URL = 'https://webhook.site/tu-url-única';

// Función para limpiar el número de teléfono (eliminar espacios, guiones, etc.)
function limpiarTelefono(telefono: string): string {
  // Eliminar todos los caracteres que no sean dígitos
  return telefono.replace(/\D/g, '');
}

export async function POST(request: NextRequest) {
  try {
    console.log('Recibida solicitud de registro');
    
    // Obtener datos del cuerpo de la solicitud
    const body = await request.json().catch(() => ({}));
    const { name, email, phone, tallerId } = body;

    console.log('Datos recibidos:', { name, email, phone, tallerId });

    // Validar datos
    if (!name || !email || !phone || !tallerId) {
      console.log('Faltan campos requeridos');
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    // Convertir tallerId a un entero seguro
    const tallerIdSafe = safeInteger(tallerId);
    if (tallerIdSafe !== parseInt(String(tallerId))) {
      console.log('ID de taller inválido:', tallerId);
      return NextResponse.json(
        { error: 'ID de taller inválido', details: 'El ID del taller debe ser un número entero válido' },
        { status: 400 }
      );
    }

    // Limpiar el número de teléfono
    const telefonoLimpio = limpiarTelefono(phone);
    if (!telefonoLimpio) {
      return NextResponse.json(
        { error: 'Número de teléfono inválido' },
        { status: 400 }
      );
    }

    // Verificar si las tablas existen
    try {
      // Intentar obtener la estructura de la tabla usuarios
      const { error: errorTablaUsuarios } = await supabase
        .from('usuarios')
        .select('id')
        .limit(1);
      
      if (errorTablaUsuarios) {
        console.error('Error al acceder a la tabla usuarios:', errorTablaUsuarios);
        return NextResponse.json(
          { 
            error: 'Error de configuración de la base de datos', 
            details: 'La tabla usuarios no existe o no es accesible',
            technical: errorTablaUsuarios.message
          },
          { status: 500 }
        );
      }

      // Intentar obtener la estructura de la tabla registros_talleres
      const { error: errorTablaRegistros } = await supabase
        .from('registros_talleres')
        .select('id')
        .limit(1);
      
      if (errorTablaRegistros) {
        console.error('Error al acceder a la tabla registros_talleres:', errorTablaRegistros);
        return NextResponse.json(
          { 
            error: 'Error de configuración de la base de datos', 
            details: 'La tabla registros_talleres no existe o no es accesible',
            technical: errorTablaRegistros.message
          },
          { status: 500 }
        );
      }
    } catch (error: any) {
      console.error('Error al verificar tablas:', error);
      return NextResponse.json(
        { 
          error: 'Error al verificar la estructura de la base de datos',
          details: error.message
        },
        { status: 500 }
      );
    }

    // 1. Crear o actualizar usuario buscando por teléfono
    let usuario_id;
    try {
      console.log('Buscando usuario existente con teléfono:', telefonoLimpio);
      
      // Buscar usuario existente por teléfono
      const { data: usuarioExistente, error: errorBusqueda } = await supabase
        .from('usuarios')
        .select('id, telefono')
        .eq('telefono', telefonoLimpio)
        .maybeSingle();

      if (errorBusqueda) {
        console.error('Error al buscar usuario:', errorBusqueda);
        return NextResponse.json(
          { 
            error: 'Error al buscar usuario', 
            details: errorBusqueda.message 
          },
          { status: 500 }
        );
      }

      if (usuarioExistente) {
        // Actualizar usuario existente
        usuario_id = usuarioExistente.id;
        console.log('Usuario existente encontrado, actualizando ID:', usuario_id);
        
        const { error: errorActualizacion } = await supabase
          .from('usuarios')
          .update({ 
            nombre: name, 
            email: email,
            telefono: telefonoLimpio // Guardamos el teléfono limpio
          })
          .eq('id', usuario_id);
        
        if (errorActualizacion) {
          console.error('Error al actualizar usuario:', errorActualizacion);
          return NextResponse.json(
            { 
              error: 'Error al actualizar usuario', 
              details: errorActualizacion.message 
            },
            { status: 500 }
          );
        }
        
        console.log('Usuario actualizado:', usuario_id);
      } else {
        // Crear nuevo usuario
        console.log('Usuario no encontrado, creando nuevo usuario');
        
        const { data: nuevoUsuario, error: errorCreacion } = await supabase
          .from('usuarios')
          .insert([{ 
            nombre: name, 
            email: email, 
            telefono: telefonoLimpio // Guardamos el teléfono limpio
          }])
          .select('id')
          .single();

        if (errorCreacion) {
          console.error('Error al crear usuario:', errorCreacion);
          return NextResponse.json(
            { 
              error: 'Error al crear usuario', 
              details: errorCreacion.message 
            },
            { status: 500 }
          );
        }

        if (!nuevoUsuario) {
          console.error('No se pudo crear el usuario (sin error pero sin datos)');
          return NextResponse.json(
            { 
              error: 'No se pudo crear el usuario', 
              details: 'La operación no devolvió errores pero no se creó el usuario' 
            },
            { status: 500 }
          );
        }

        usuario_id = nuevoUsuario.id;
        console.log('Nuevo usuario creado con ID:', usuario_id);
      }
    } catch (error: any) {
      console.error('Error en gestión de usuario:', error);
      return NextResponse.json(
        { 
          error: 'Error al procesar el usuario',
          details: error.message
        },
        { status: 500 }
      );
    }

    // 2. Registrar en taller
    let registroId;
    try {
      console.log('Verificando registro existente para usuario', usuario_id, 'en taller', tallerIdSafe);
      
      // Verificar si ya existe el registro
      const { data: registroExistente, error: errorBusquedaRegistro } = await supabase
        .from('registros_talleres')
        .select('id')
        .eq('usuario_id', usuario_id)
        .eq('taller_id', tallerIdSafe)
        .maybeSingle();

      if (errorBusquedaRegistro) {
        console.error('Error al buscar registro existente:', errorBusquedaRegistro);
        return NextResponse.json(
          { 
            error: 'Error al buscar registro existente', 
            details: errorBusquedaRegistro.message 
          },
          { status: 500 }
        );
      }

      if (registroExistente) {
        registroId = registroExistente.id;
        console.log('Registro existente encontrado:', registroId);
        
        // Actualizar el registro existente a estado pendiente
        const { error: errorActualizacionRegistro } = await supabase
          .from('registros_talleres')
          .update({
            estado: 'pendiente',
            updated_at: new Date().toISOString()
          })
          .eq('id', registroId);
          
        if (errorActualizacionRegistro) {
          console.error('Error al actualizar registro:', errorActualizacionRegistro);
          return NextResponse.json(
            { 
              error: 'Error al actualizar registro', 
              details: errorActualizacionRegistro.message 
            },
            { status: 500 }
          );
        }
          
        console.log('Registro actualizado a pendiente:', registroId);
      } else {
        // Crear nuevo registro
        console.log('Creando nuevo registro para usuario', usuario_id, 'en taller', tallerIdSafe);
        
        const { data: nuevoRegistro, error: errorRegistro } = await supabase
          .from('registros_talleres')
          .insert([{
            usuario_id: usuario_id,
            taller_id: tallerIdSafe, // Usar el ID seguro
            estado: 'pendiente',
            datos_adicionales: { 
              origen: 'web',
              fecha_registro: new Date().toISOString()
            }
          }])
          .select('id')
          .single();

        if (errorRegistro) {
          console.error('Error al crear registro:', errorRegistro);
          return NextResponse.json(
            { 
              error: 'Error al crear registro', 
              details: errorRegistro.message 
            },
            { status: 500 }
          );
        }

        if (!nuevoRegistro) {
          console.error('No se pudo crear el registro (sin error pero sin datos)');
          return NextResponse.json(
            { 
              error: 'No se pudo crear el registro', 
              details: 'La operación no devolvió errores pero no se creó el registro' 
            },
            { status: 500 }
          );
        }

        registroId = nuevoRegistro.id;
        console.log('Nuevo registro creado:', registroId);
      }
    } catch (error: any) {
      console.error('Error en registro de taller:', error);
      return NextResponse.json(
        { 
          error: 'Error al registrar en el taller',
          details: error.message
        },
        { status: 500 }
      );
    }

    // 3. Enviar webhook (opcional, no fallamos si esto falla)
    try {
      // Obtener datos para el webhook
      console.log('Obteniendo datos para el webhook...');
      
      const { data: datosUsuario, error: errorUsuarioWebhook } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', usuario_id)
        .single();

      if (errorUsuarioWebhook) {
        console.error('Error al obtener datos de usuario para webhook:', errorUsuarioWebhook);
        throw new Error(`Error al obtener datos de usuario: ${errorUsuarioWebhook.message}`);
      }

      console.log('Datos de usuario obtenidos:', datosUsuario);

      const { data: datosTaller, error: errorTallerWebhook } = await supabase
        .from('talleres')
        .select('*')
        .eq('id', tallerIdSafe) // Usar el ID seguro
        .single();

      if (errorTallerWebhook) {
        console.error('Error al obtener datos de taller para webhook:', errorTallerWebhook);
        throw new Error(`Error al obtener datos de taller: ${errorTallerWebhook.message}`);
      }

      console.log('Datos de taller obtenidos:', datosTaller);

      // Preparar payload
      const payload = {
        registro_id: registroId,
        fecha_registro: new Date().toISOString(),
        usuario: datosUsuario,
        taller: datosTaller,
        origen: 'web'
      };

      console.log('Payload del webhook:', JSON.stringify(payload));
      console.log('Enviando webhook a:', WEBHOOK_URL);
      
      // Enviar webhook con timeout y retry
      let intentos = 0;
      const maxIntentos = 3;
      let exito = false;

      while (intentos < maxIntentos && !exito) {
        try {
          intentos++;
          console.log(`Intento ${intentos} de envío de webhook...`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos de timeout
          
          const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'User-Agent': 'Aztec-App/1.0',
              'X-Webhook-Source': 'aztec-talleres'
            },
            body: JSON.stringify(payload),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          const responseText = await response.text();
          console.log(`Respuesta del webhook (${response.status}):`, responseText);
          
          if (response.ok) {
            exito = true;
            console.log('Webhook enviado exitosamente');
          } else {
            console.error(`Error en respuesta del webhook: ${response.status} ${response.statusText}`);
            // Esperar antes del siguiente intento
            if (intentos < maxIntentos) {
              await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
            }
          }
        } catch (error) {
          console.error(`Error en intento ${intentos} de envío de webhook:`, error);
          // Esperar antes del siguiente intento
          if (intentos < maxIntentos) {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Esperar 2 segundos
          }
        }
      }

      if (!exito) {
        console.error(`No se pudo enviar el webhook después de ${maxIntentos} intentos`);
      }
    } catch (error) {
      // No fallamos la petición si el webhook falla
      console.error('Error general al enviar webhook:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Registro completado con éxito',
      data: {
        usuario_id: usuario_id,
        registro_id: registroId
      }
    });
  } catch (error: any) {
    console.error('Error general en el proceso:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message || 'Error desconocido'
      },
      { status: 500 }
    );
  }
} 