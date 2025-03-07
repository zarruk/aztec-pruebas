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
    detectSessionInUrl: false, // Desactivamos esto para manejar manualmente el callback
    flowType: 'pkce'
  }
});

// Configurar la URL de redirección para la autenticación
const redirectUrl = `${getSiteUrl()}/auth/callback`;
console.log('Supabase configurado con URL de redirección:', redirectUrl);

// Función para iniciar sesión con enlace mágico
export async function signInWithMagicLink(email: string) {
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectUrl
    }
  });
}

// Inicializar el cliente de Supabase y configurar el listener de eventos de autenticación
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Evento de autenticación:', event);
  console.log('Sesión presente:', session ? 'Sí' : 'No');
  
  if (session) {
    console.log('Información del usuario autenticado:');
    console.log('- ID:', session.user.id);
    console.log('- Email:', session.user.email);
    console.log('- Último inicio de sesión:', new Date(session.user.last_sign_in_at || '').toLocaleString());
    console.log('- Creado:', new Date(session.user.created_at || '').toLocaleString());
    
    // Verificar si el usuario tiene datos adicionales
    if (session.user.user_metadata) {
      console.log('- Metadatos:', session.user.user_metadata);
    }
  }
});

// Verificar si hay una sesión activa al cargar la página
async function checkInitialSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) {
    console.log('Sesión inicial detectada para:', data.session.user.email);
  } else {
    console.log('No hay sesión inicial activa');
  }
}

// Ejecutar la verificación inicial
checkInitialSession();

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