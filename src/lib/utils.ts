import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createClient } from "@supabase/supabase-js";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Obtiene el siguiente ID disponible para una tabla específica
 * @param supabase Cliente de Supabase
 * @param tableName Nombre de la tabla
 * @returns El siguiente ID disponible (máximo actual + 1)
 */
export async function getNextId(supabase: any, tableName: string): Promise<number> {
  try {
    console.log(`Obteniendo el siguiente ID para la tabla ${tableName}...`);
    
    // Consultar el máximo ID actual
    const { data, error } = await supabase
      .from(tableName)
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (error) {
      console.error('Error al obtener el máximo ID:', error);
      throw error;
    }
    
    // Si hay datos, tomar el máximo ID y sumar 1
    const nextId = data && data.length > 0 ? data[0].id + 1 : 1;
    console.log(`Siguiente ID para ${tableName}: ${nextId}`);
    
    return nextId;
  } catch (error) {
    console.error('Error en getNextId:', error);
    // Devolver un ID seguro en caso de error
    return Math.floor(Math.random() * 1000) + 1000;
  }
}

/**
 * Genera un ID seguro para usar en la base de datos
 * que está dentro del rango de un entero de PostgreSQL
 */
export function generateSafeId(): number {
  // Obtener el timestamp actual
  const timestamp = Date.now();
  
  // Usar los últimos 7 dígitos para estar seguro (máximo 9999999)
  // Esto es seguro para PostgreSQL integer (máximo ~2.147 millones)
  return timestamp % 10000000;
} 