import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

// Importa la interfaz Taller si está en un archivo separado
interface Taller {
  id: number;
  titulo: string;
  descripcion: string;
  precio: number;
  fecha: string;
  duracion: string;
  tipo: string;
  imagen_url: string;
  [key: string]: any; // Para permitir campos adicionales
}

async function fetchTalleres() {
  console.log("Iniciando carga de talleres...");
  
  // Verificar que las variables de entorno estén configuradas
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error("Variables de entorno de Supabase no configuradas");
    return [];
  }
  
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log("Cliente Supabase creado, obteniendo talleres...");
    
    const { data, error } = await supabase
      .from('talleres')
      .select('*');
    
    if (error) {
      console.error("Error al obtener talleres:", error);
      return [];
    }
    
    console.log(`Talleres obtenidos: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    console.error("Error inesperado al obtener talleres:", error);
    return [];
  }
}

export default function Home() {
  redirect('/talleres');
  
  // Este código nunca se ejecutará debido a la redirección
  return null;
}
