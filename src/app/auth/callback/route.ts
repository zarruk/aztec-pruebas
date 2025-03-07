import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de correos autorizados
const ALLOWED_EMAILS = ['martin@azteclab.co', 'salomon@azteclab.co'];

// Forzar que esta ruta sea dinámica para evitar problemas de caché
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const error_description = requestUrl.searchParams.get('error_description');
  
  // URL HARDCODEADA para redirección
  const SITE_URL = 'https://aztec-nuevo.onrender.com';
  // URL para desarrollo local
  const LOCAL_URL = 'http://localhost:3000';
  
  // Determinar la URL base según el entorno
  const baseUrl = request.headers.get('host')?.includes('localhost') 
    ? LOCAL_URL 
    : SITE_URL;
  
  console.log('URL base para redirección:', baseUrl);
  console.log('URL completa del callback:', request.url);
  console.log('Código de autenticación recibido:', code ? 'Sí' : 'No');
  
  // Si hay un error en la URL, redirigir a la página de login con el mensaje de error
  if (error || error_description) {
    console.error('Error en la URL del callback:', error, error_description);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error_description || error || 'Error desconocido')}`
    );
  }

  // Si no hay código, redirigir a la página de login
  if (!code) {
    console.error('No se recibió código de autenticación en el callback');
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('No se recibió código de autenticación')}`
    );
  }

  try {
    // Crear un cliente de Supabase para el servidor
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    });
    
    // Intercambiar el código por una sesión
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('Error al intercambiar código por sesión:', error.message);
      console.error('Detalles del error:', JSON.stringify(error));
      // Redirigir a la página de login con un mensaje de error
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Error de autenticación: ' + error.message)}`
      );
    }
    
    // Verificar si el usuario tiene una sesión
    if (!data.session) {
      console.error('No se pudo establecer la sesión');
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('No se pudo establecer la sesión')}`
      );
    }
    
    // Verificar si el correo del usuario está en la lista de permitidos
    const userEmail = data.session.user.email;
    console.log('Email del usuario:', userEmail);
    
    if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
      console.error('Acceso denegado: correo no autorizado');
      
      // Cerrar la sesión del usuario no autorizado
      await supabase.auth.signOut();
      
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent('Acceso denegado: solo los usuarios autorizados pueden acceder al sistema')}`
      );
    }
    
    console.log('Sesión establecida correctamente para usuario autorizado:', userEmail);
    console.log('ID de usuario:', data.session.user.id);
    
    // Redirigir al dashboard después de la autenticación exitosa
    return NextResponse.redirect(`${baseUrl}/dashboard`);
  } catch (err: any) {
    console.error('Excepción en el callback de autenticación:', err);
    console.error('Mensaje de error:', err.message);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent('Error inesperado: ' + err.message)}`
    );
  }
} 