import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // URL HARDCODEADA para redirección
  const SITE_URL = 'https://aztec-nuevo.onrender.com';
  console.log('URL hardcodeada para redirección en callback:', SITE_URL);
  console.log('Código de autenticación recibido:', code ? 'Sí' : 'No');

  if (code) {
    try {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      // Intercambiar el código por una sesión
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error('Error al intercambiar código por sesión:', error.message);
        // Redirigir a la página de login con un mensaje de error
        return NextResponse.redirect(`${SITE_URL}/login?error=${encodeURIComponent('Error de autenticación')}`);
      }
      
      console.log('Sesión establecida correctamente:', data.session ? 'Sí' : 'No');
      
      // Redirigir al dashboard después de la autenticación exitosa
      return NextResponse.redirect(`${SITE_URL}/dashboard`);
    } catch (err) {
      console.error('Excepción en el callback de autenticación:', err);
      return NextResponse.redirect(`${SITE_URL}/login?error=${encodeURIComponent('Error inesperado')}`);
    }
  } else {
    console.error('No se recibió código de autenticación en el callback');
    return NextResponse.redirect(`${SITE_URL}/login?error=${encodeURIComponent('No se recibió código de autenticación')}`);
  }
} 