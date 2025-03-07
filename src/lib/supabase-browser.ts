'use client';

import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// URL HARDCODEADA para redirección - ASEGÚRATE DE QUE ESTA ES LA URL CORRECTA
const SITE_URL = 'https://aztec-nuevo.onrender.com';

// Función para obtener la URL del sitio (sin intentar modificar window.location.origin)
const getSiteUrl = () => {
  // En producción, usar la URL hardcodeada
  return SITE_URL;
};

// Registrar la URL que se usará para redirección
console.log('URL del sitio para redirección:', getSiteUrl());

// Crear el cliente de Supabase para uso exclusivo en el navegador
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    storageKey: 'supabase.auth.token'
  },
  global: {
    headers: {
      'X-Supabase-Auth-Redirect-To': `${getSiteUrl()}/auth/callback`
    }
  }
});

console.log('Supabase configurado con URL de redirección:', `${getSiteUrl()}/auth/callback`);

// Inicializar el cliente de Supabase
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Evento de autenticación:', event);
  console.log('Sesión presente:', session ? 'Sí' : 'No');
});

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