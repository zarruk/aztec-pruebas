import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // Obtener la URL base para redirecciones
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://aztec-nuevo-ii.vercel.app';
  console.log('URL base para redirección en callback:', baseUrl);

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Intercambiar el código por una sesión
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirigir al dashboard después de la autenticación
  return NextResponse.redirect(new URL('/dashboard', baseUrl));
} 