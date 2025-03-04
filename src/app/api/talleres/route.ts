import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Faltan las variables de entorno de Supabase');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const data = await request.json();
    
    console.log('Datos recibidos en la API:', data);
    
    // Insertar en la base de datos
    const { data: taller, error } = await supabase
      .from('talleres')
      .insert([data])
      .select();
      
    if (error) {
      console.error('Error de Supabase:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, taller }, { status: 201 });
  } catch (error) {
    console.error('Error en la API:', error);
    return NextResponse.json(
      { error: 'Error al crear el taller' }, 
      { status: 500 }
    );
  }
} 