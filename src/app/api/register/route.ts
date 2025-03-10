import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

// Inicializar cliente de Supabase con la clave correcta
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno de Supabase');
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// URL del webhook principal
const WEBHOOK_URL = 'https://aztec.app.n8n.cloud/webhook/6ab724ec-631c-4a0f-b3f8-c5a401c28619';
// URL de webhook de respaldo para depuración (opcional)
// const DEBUG_WEBHOOK_URL = 'https://webhook.site/tu-url-única';

// Función para limpiar el número de teléfono
function limpiarTelefono(telefono: string): string {
  console.log('Teléfono original:', telefono);
  
  // Detectar código de país
  let codigoPais = '';
  let numeroLimpio = telefono;
  
  // Si comienza con +, extraer el código de país
  if (telefono.startsWith('+')) {
    const match = telefono.match(/^\+(\d{1,3})/);
    if (match && match[1]) {
      codigoPais = match[1];
      console.log('Código de país detectado:', codigoPais);
      // Eliminar el código de país del número
      numeroLimpio = telefono.replace(/^\+\d{1,3}\s*/, '');
    }
  }
  
  // Eliminar todos los caracteres no numéricos
  numeroLimpio = numeroLimpio.replace(/\D/g, '');
  console.log('Número sin código de país y limpio:', numeroLimpio);
  
  // Reconstruir el número con formato internacional
  const telefonoLimpio = `+${codigoPais}${numeroLimpio}`;
  console.log('Teléfono limpio:', telefonoLimpio);
  
  return telefonoLimpio;
}

export async function POST(request: NextRequest) {
  console.log('Recibida solicitud de registro');
  
  try {
    // 1. Obtener datos del cuerpo de la solicitud
    const data = await request.json();
    console.log('Datos recibidos:', data);
    
    const { name, email, phone, tallerId: tallerIdRaw, referidoPor } = data;
    
    // Validar datos requeridos
    if (!name || !email || !phone || !tallerIdRaw) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }
    
    // Asegurarse de que tallerId sea un número entero
    let tallerId;
    try {
      tallerId = parseInt(tallerIdRaw.toString(), 10);
      if (isNaN(tallerId)) {
        console.error('tallerId no es un número válido:', tallerIdRaw);
        return NextResponse.json(
          { error: 'ID de taller inválido' },
          { status: 400 }
        );
      }
      console.log('tallerId convertido a entero:', tallerId);
    } catch (error) {
      console.error('Error al convertir tallerId:', error);
      return NextResponse.json(
        { error: 'ID de taller inválido' },
        { status: 400 }
      );
    }
    
    // 2. Limpiar teléfono
    const telefonoLimpio = limpiarTelefono(phone);
    
    // 3. BUSCAR USUARIO POR TELÉFONO O EMAIL
    console.log('Buscando usuario existente con teléfono:', telefonoLimpio, 'o email:', email);

    // Primero buscar por teléfono
    const { data: usuarioPorTelefono, error: errorBusquedaTelefono } = await supabase
      .from('usuarios')
      .select('id, nombre, email, telefono')
      .eq('telefono', telefonoLimpio)
      .maybeSingle();

    if (errorBusquedaTelefono) {
      console.error('Error al buscar usuario por teléfono:', errorBusquedaTelefono);
      return NextResponse.json(
        { error: 'Error al buscar usuario', details: errorBusquedaTelefono.message },
        { status: 500 }
      );
    }

    // Luego buscar por email
    const { data: usuarioPorEmail, error: errorBusquedaEmail } = await supabase
      .from('usuarios')
      .select('id, nombre, email, telefono')
      .eq('email', email)
      .maybeSingle();

    if (errorBusquedaEmail) {
      console.error('Error al buscar usuario por email:', errorBusquedaEmail);
      return NextResponse.json(
        { error: 'Error al buscar usuario', details: errorBusquedaEmail.message },
        { status: 500 }
      );
    }

    console.log('Usuario existente por teléfono:', usuarioPorTelefono);
    console.log('Usuario existente por email:', usuarioPorEmail);

    let usuarioId;
    
    // 4. ACTUALIZAR O CREAR USUARIO
    if (usuarioPorTelefono) {
      // USUARIO EXISTE CON ESTE TELÉFONO - ACTUALIZAR
      usuarioId = usuarioPorTelefono.id;
      console.log('Actualizando usuario existente con ID:', usuarioId);
      
      const { error: errorActualizacion } = await supabase
        .from('usuarios')
        .update({
          nombre: name,
          email: email,
          ultima_actualizacion: new Date().toISOString()
        })
        .eq('id', usuarioId);
      
      if (errorActualizacion) {
        console.error('Error al actualizar usuario:', errorActualizacion);
        
        // Si falla la actualización completa, intentar actualizar solo el nombre
        console.log('Intentando actualizar solo el nombre');
        const { error: errorNombre } = await supabase
          .from('usuarios')
          .update({ 
            nombre: name,
            ultima_actualizacion: new Date().toISOString()
          })
          .eq('id', usuarioId);
        
        if (errorNombre) {
          console.error('Error al actualizar solo el nombre:', errorNombre);
          return NextResponse.json(
            { error: 'Error al actualizar usuario', details: errorNombre.message },
            { status: 500 }
          );
        }
      }
      
      console.log('Usuario actualizado correctamente');
    } else if (usuarioPorEmail) {
      // USUARIO EXISTE CON ESTE EMAIL PERO DIFERENTE TELÉFONO
      usuarioId = usuarioPorEmail.id;
      console.log('Usuario con este email ya existe pero con diferente teléfono. ID:', usuarioId);
      
      // Actualizar el teléfono del usuario existente
      const { error: errorActualizacion } = await supabase
        .from('usuarios')
        .update({
          nombre: name,
          telefono: telefonoLimpio,
          ultima_actualizacion: new Date().toISOString()
        })
        .eq('id', usuarioId);
      
      if (errorActualizacion) {
        console.error('Error al actualizar usuario:', errorActualizacion);
        return NextResponse.json(
          { error: 'Error al actualizar usuario', details: errorActualizacion.message },
          { status: 500 }
        );
      }
      
      console.log('Usuario actualizado correctamente con nuevo teléfono');
    } else {
      // USUARIO NO EXISTE - CREAR NUEVO
      console.log('Creando nuevo usuario');
      
      // Generar un UUID manualmente
      const userId = randomUUID();
      console.log('UUID generado para el usuario:', userId);
      
      const { data: nuevoUsuario, error: errorCreacion } = await supabase
        .from('usuarios')
        .insert({
          id: userId,
          nombre: name,
          email: email,
          telefono: telefonoLimpio
        })
        .select('id')
        .single();
      
      if (errorCreacion) {
        console.error('Error al crear usuario:', errorCreacion);
        return NextResponse.json(
          { error: 'Error al crear usuario', details: errorCreacion.message },
          { status: 500 }
        );
      }
      
      usuarioId = nuevoUsuario.id;
      console.log('Nuevo usuario creado con ID:', usuarioId);
    }
    
    // 5. VERIFICAR SI YA EXISTE UN REGISTRO PARA ESTE USUARIO Y TALLER
    console.log('Verificando si ya existe un registro para usuario:', usuarioId, 'y taller:', tallerId);
    console.log('Tipo de usuarioId:', typeof usuarioId, 'Valor:', usuarioId);
    console.log('Tipo de tallerId:', typeof tallerId, 'Valor:', tallerId);

    // Primero verificar si hay múltiples registros (esto no debería ocurrir)
    const { data: todosRegistros, error: errorTodosRegistros } = await supabase
      .from('registros_talleres')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('taller_id', tallerId);

    if (errorTodosRegistros) {
      console.error('Error al buscar todos los registros:', errorTodosRegistros);
    } else {
      console.log('Cantidad de registros encontrados:', todosRegistros?.length || 0);
      if (todosRegistros && todosRegistros.length > 1) {
        console.warn('ALERTA: Se encontraron múltiples registros para el mismo usuario y taller:', todosRegistros);
        
        // Mantener solo el primer registro y eliminar los demás
        const primerRegistroId = todosRegistros[0].id;
        console.log('Manteniendo el primer registro con ID:', primerRegistroId);
        
        // Eliminar los registros duplicados
        for (let i = 1; i < todosRegistros.length; i++) {
          const duplicadoId = todosRegistros[i].id;
          console.log('Eliminando registro duplicado con ID:', duplicadoId);
          
          const { error: errorEliminacion } = await supabase
            .from('registros_talleres')
            .delete()
            .eq('id', duplicadoId);
          
          if (errorEliminacion) {
            console.error('Error al eliminar registro duplicado:', errorEliminacion);
          } else {
            console.log('Registro duplicado eliminado correctamente');
          }
        }
      }
    }

    // Ahora hacer la consulta con single() si sabemos que hay exactamente un registro,
    // o con maybeSingle() si podría no haber ninguno
    let registroExistente = null;
    let errorBusquedaRegistro = null;

    if (todosRegistros && todosRegistros.length === 1) {
      // Sabemos que hay exactamente un registro, usar single()
      const resultado = await supabase
        .from('registros_talleres')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('taller_id', tallerId)
        .single();
      
      registroExistente = resultado.data;
      errorBusquedaRegistro = resultado.error;
    } else {
      // Podría no haber ningún registro, usar maybeSingle()
      const resultado = await supabase
        .from('registros_talleres')
        .select('id')
        .eq('usuario_id', usuarioId)
        .eq('taller_id', tallerId)
        .maybeSingle();
      
      registroExistente = resultado.data;
      errorBusquedaRegistro = resultado.error;
    }

    if (errorBusquedaRegistro) {
      console.error('Error al buscar registro existente:', errorBusquedaRegistro);
      console.error('Detalles completos del error:', JSON.stringify(errorBusquedaRegistro));
      return NextResponse.json(
        { error: 'Error al buscar registro', details: errorBusquedaRegistro.message },
        { status: 500 }
      );
    }

    console.log('Registro existente encontrado:', registroExistente);
    
    let registroId;
    let mensaje;
    
    // Verificar si el referidoPor existe como usuario
    let referidoPorValido = null;
    if (referidoPor) {
      console.log('Verificando si el referido existe:', referidoPor);
      
      const { data: usuarioReferido, error: errorReferido } = await supabase
        .from('usuarios')
        .select('id')
        .eq('id', referidoPor)
        .maybeSingle();
      
      if (errorReferido) {
        console.error('Error al verificar referido:', errorReferido);
        // Continuamos con referidoPorValido = null
      } else if (usuarioReferido) {
        // Usar el UUID directamente como referido_por
        referidoPorValido = usuarioReferido.id;
        console.log('Referido válido encontrado:', referidoPorValido);
      } else {
        console.log('Referido no encontrado, se usará null');
      }
    }
    
    if (registroExistente) {
      // REGISTRO EXISTE - ACTUALIZAR
      registroId = registroExistente.id;
      console.log('Actualizando registro existente con ID:', registroId);
      
      const { error: errorActualizacionRegistro } = await supabase
        .from('registros_talleres')
        .update({
          referido_por: referidoPorValido,
          fecha_registro: new Date().toISOString()
        })
        .eq('id', registroId);
      
      if (errorActualizacionRegistro) {
        console.error('Error al actualizar registro:', errorActualizacionRegistro);
        return NextResponse.json(
          { error: 'Error al actualizar registro', details: errorActualizacionRegistro.message },
          { status: 500 }
        );
      }
      
      console.log('Registro actualizado correctamente');
      mensaje = 'Registro actualizado correctamente';
    } else {
      // REGISTRO NO EXISTE - CREAR NUEVO
      console.log('Creando nuevo registro para usuario:', usuarioId, 'y taller:', tallerId);
      
      const { data: nuevoRegistro, error: errorRegistro } = await supabase
        .from('registros_talleres')
        .insert({
          usuario_id: usuarioId,
          taller_id: tallerId,
          referido_por: referidoPorValido,
          fecha_registro: new Date().toISOString()
        })
        .select('id')
        .single();
      
      if (errorRegistro) {
        console.error('Error al crear registro:', errorRegistro);
        return NextResponse.json(
          { error: 'Error al crear registro', details: errorRegistro.message },
          { status: 500 }
        );
      }
      
      registroId = nuevoRegistro.id;
      console.log('Registro creado correctamente, ID:', registroId);
      mensaje = 'Registro creado correctamente';
    }
    
    // Obtener información del taller
    console.log('Obteniendo información del taller:', tallerId);
    const { data: tallerInfo, error: errorTaller } = await supabase
      .from('talleres')
      .select('*')
      .eq('id', tallerId)
      .single();
    
    if (errorTaller) {
      console.error('Error al obtener información del taller:', errorTaller);
      // Continuamos aunque no se pueda obtener la info del taller
    }
    
    // Enviar datos al webhook
    try {
      console.log('Enviando datos al webhook:', WEBHOOK_URL);
      
      const webhookData = {
        nombre: name,
        email: email,
        telefono: telefonoLimpio,
        taller_id: tallerId,
        taller_nombre: tallerInfo?.nombre || 'Taller no encontrado',
        taller_tipo: tallerInfo?.tipo || 'desconocido',
        taller_fecha: tallerInfo?.fecha || null,
        usuario_id: usuarioId,
        registro_id: registroId,
        referido_por: referidoPorValido,
        fecha_registro: new Date().toISOString()
      };
      
      console.log('Datos a enviar al webhook:', webhookData);
      
      const webhookResponse = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });
      
      if (!webhookResponse.ok) {
        console.error('Error al enviar datos al webhook. Status:', webhookResponse.status);
        const errorText = await webhookResponse.text();
        console.error('Respuesta de error del webhook:', errorText);
      } else {
        console.log('Datos enviados correctamente al webhook');
      }
    } catch (webhookError: any) {
      console.error('Error al enviar datos al webhook:', webhookError);
      // No interrumpimos el flujo si falla el webhook
    }
    
    // 6. RESPUESTA EXITOSA
    return NextResponse.json({
      success: true,
      message: mensaje,
      userId: usuarioId,
      registroId: registroId
    });
    
  } catch (error: any) {
    console.error('Error en el proceso de registro:', error);
    return NextResponse.json(
      { error: error.message || 'Error en el proceso de registro' },
      { status: 500 }
    );
  }
} 