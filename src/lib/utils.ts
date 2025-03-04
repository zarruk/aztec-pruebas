import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene el siguiente ID disponible para una tabla específica
 * @param tableName Nombre de la tabla en Supabase
 * @returns El siguiente ID consecutivo
 */
export async function getNextId(tableName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error(`Error al obtener el ID máximo de ${tableName}:`, error);
      return null;
    }
    
    return data && data.length > 0 ? data[0].id + 1 : 1;
  } catch (error) {
    console.error(`Error inesperado al obtener el ID máximo de ${tableName}:`, error);
    return null;
  }
} 