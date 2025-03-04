import { createClient } from '@supabase/supabase-js';

// Estas variables deben estar en tu archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Crear el cliente de Supabase
export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    }
  });
};

// Cliente para uso en el lado del cliente
let supabaseClient: ReturnType<typeof createClient> | null = null;

if (typeof window !== 'undefined') {
  supabaseClient = createSupabaseClient();
}

export const supabase = supabaseClient; 