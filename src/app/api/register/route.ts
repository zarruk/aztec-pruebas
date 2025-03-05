import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

    // Limpiar el número de teléfono para usarlo como ID
    const telefonoLimpio = limpiarTelefono(phone);
    if (!telefonoLimpio) {
      return NextResponse.json(
        { error: 'Número de teléfono inválido' },
        { status: 400 }
      );
    }

    // 1. Crear o actualizar usuario usando el teléfono como ID
    try {
      console.log('Buscando usuario existente con teléfono:', telefonoLimpio);
      
      // Buscar usuario existente por ID (teléfono)
      const { data: usuarioExistente, error: errorBusqueda } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', telefonoLimpio)
        .maybeSingle();

      if (errorBusqueda) {
        console.error('Error al buscar usuario:', errorBusqueda);
      }

      if (usuarioExistente) {
        // Actualizar usuario existente
        console.log('Usuario existente encontrado, actualizando:', telefonoLimpio);
        
        await supabase
          .from('usuarios')
          .update({ 
            nombre: name, 
            email: email,
            telefono: phone // Guardamos el teléfono original con formato
          })
          .eq('id', telefonoLimpio);
        
        console.log('Usuario actualizado:', telefonoLimpio);
      } else {
        // Crear nuevo usuario
        console.log('Usuario no encontrado, creando nuevo usuario con ID:', telefonoLimpio);
        
        const { error: errorCreacion } = await supabase
          .from('usuarios')
          .insert([{ 
            id: telefonoLimpio, 
            nombre: name, 
            email: email, 
            telefono: phone // Guardamos el teléfono original con formato
          }]);

        if (errorCreacion) {
          throw new Error(`Error al crear usuario: ${errorCreacion.message}`);
        }

        console.log('Nuevo usuario creado con ID:', telefonoLimpio);
      }
    } catch (error) {
      console.error('Error en gestión de usuario:', error);
      return NextResponse.json(
        { error: 'Error al procesar el usuario' },
        { status: 500 }
      );
    }

    // 2. Registrar en taller
    let registroId;
    try {
      console.log('Verificando registro existente para usuario', telefonoLimpio, 'en taller', tallerId);
      
      // Verificar si ya existe el registro
      const { data: registroExistente } = await supabase
        .from('registros_talleres')
        .select('id')
        .eq('usuario_id', telefonoLimpio)
        .eq('taller_id', tallerId)
        .maybeSingle();

      if (registroExistente) {
        registroId = registroExistente.id;
        console.log('Registro existente encontrado:', registroId);
        
        // Actualizar el registro existente a estado pendiente
        await supabase
          .from('registros_talleres')
          .update({
            estado: 'pendiente',
            updated_at: new Date().toISOString()
          })
          .eq('id', registroId);
          
        console.log('Registro actualizado a pendiente:', registroId);
      } else {
        // Crear nuevo registro
        console.log('Creando nuevo registro para usuario', telefonoLimpio, 'en taller', tallerId);
        
        const { data: nuevoRegistro, error: errorRegistro } = await supabase
          .from('registros_talleres')
          .insert([{
            usuario_id: telefonoLimpio,
            taller_id: tallerId,
            estado: 'pendiente',
            datos_adicionales: { 
              origen: 'web',
              fecha_registro: new Date().toISOString()
            }
          }])
          .select('id')
          .single();

        if (errorRegistro || !nuevoRegistro) {
          throw new Error(`Error al crear registro: ${errorRegistro?.message || 'Desconocido'}`);
        }

        registroId = nuevoRegistro.id;
        console.log('Nuevo registro creado:', registroId);
      }
    } catch (error) {
      console.error('Error en registro de taller:', error);
      return NextResponse.json(
        { error: 'Error al registrar en el taller' },
        { status: 500 }
      );
    }

    // 3. Enviar webhook
    try {
      // Obtener datos para el webhook
      console.log('Obteniendo datos para el webhook...');
      
      const { data: datosUsuario } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', telefonoLimpio)
        .single();

      console.log('Datos de usuario obtenidos:', datosUsuario);

      const { data: datosTaller } = await supabase
        .from('talleres')
        .select('*')
        .eq('id', tallerId)
        .single();

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
        usuario_id: telefonoLimpio,
        registro_id: registroId
      }
    });
  } catch (error) {
    console.error('Error general en el proceso:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 