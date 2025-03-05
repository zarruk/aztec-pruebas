import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: Iniciando actualización de taller');
    console.log('API: ID del taller:', params.id);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('API: Faltan variables de entorno de Supabase');
      return NextResponse.json(
        { error: 'Faltan variables de entorno de Supabase' },
        { status: 500 }
      );
    }

    console.log('API: Variables de entorno OK');
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Obtener y loguear el cuerpo de la solicitud
    const rawData = await request.text();
    console.log('API: Datos recibidos (raw):', rawData);
    
    let data;
    try {
      data = JSON.parse(rawData);
      console.log('API: Datos parseados:', data);
    } catch (e) {
      console.error('API: Error al parsear JSON:', e);
      return NextResponse.json(
        { error: 'Error al parsear JSON' },
        { status: 400 }
      );
    }
    
    // Extraer solo los campos que queremos actualizar
    const updateData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      video_url: data.video_url,
      tipo: data.tipo,
      fecha_vivo: data.fecha_vivo,
      fecha_live_build: data.fecha_live_build,
      herramientas: data.herramientas,
      campos_webhook: data.campos_webhook,
      precio: data.precio,
      capacidad: data.capacidad,
      imagen_url: data.imagen_url
    };
    
    console.log(`API: Actualizando taller con ID: ${params.id}`);
    console.log('API: Datos de actualización:', updateData);
    
    // Verificar primero si el taller existe
    const { data: existingTaller, error: fetchError } = await supabase
      .from('talleres')
      .select('id')
      .eq('id', params.id)
      .single();
    
    if (fetchError) {
      console.error('API: Error al verificar si el taller existe:', fetchError);
      return NextResponse.json(
        { error: `Taller con ID ${params.id} no encontrado` },
        { status: 404 }
      );
    }
    
    console.log('API: Taller encontrado, procediendo con la actualización');
    
    // Versión simplificada de los datos de actualización
    const simpleUpdateData = {
      nombre: data.nombre,
      descripcion: data.descripcion
    };

    console.log('API: Intentando actualización simplificada primero');
    const { error: simpleError } = await supabase
      .from('talleres')
      .update(simpleUpdateData)
      .eq('id', params.id);

    if (simpleError) {
      console.error('API: Error en actualización simplificada:', simpleError);
      return NextResponse.json({ error: simpleError.message }, { status: 400 });
    }

    console.log('API: Actualización simplificada exitosa, procediendo con actualización completa');
    
    const { data: updatedData, error } = await supabase
      .from('talleres')
      .update(updateData)
      .eq('id', params.id)
      .select();
    
    if (error) {
      console.error('API: Error al actualizar taller:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    console.log('API: Taller actualizado exitosamente:', updatedData);
    return NextResponse.json({ success: true, data: updatedData });
  } catch (error: any) {
    console.error('API: Error inesperado:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 