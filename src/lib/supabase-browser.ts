'use client';

import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// URL HARDCODEADA para redirección - ASEGÚRATE DE QUE ESTA ES LA URL CORRECTA
const SITE_URL = 'https://aztec-nuevo.onrender.com';

// Crear el cliente de Supabase para uso exclusivo en el navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'X-Supabase-Auth-Redirect-To': `${SITE_URL}/auth/callback`,
      'X-Supabase-Site-URL': SITE_URL
    }
  }
});

console.log('Supabase configurado con URL de redirección:', SITE_URL);

export function createSupabaseClient() {
  return supabase;
}

// Función de ayuda para depurar
export async function testSupabaseConnection() {
  try {
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await client.from('talleres').select('count').limit(1);
    
    if (error) {
      console.error('Error al conectar con Supabase:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Excepción al conectar con Supabase:', err);
    return { success: false, error: err };
  }
} 