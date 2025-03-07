import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  // URL HARDCODEADA para redirección
  const SITE_URL = 'https://aztec-nuevo-ii.onrender.com';
  console.log('URL hardcodeada para redirección en callback:', SITE_URL);

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Intercambiar el código por una sesión
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirigir al dashboard después de la autenticación
  return NextResponse.redirect(`${SITE_URL}/dashboard`);
} 