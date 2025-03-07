// Comentar temporalmente todo el middleware para pruebas
/*
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Tu código de middleware aquí
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
*/

// Middleware simplificado para pruebas
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';

// Lista de correos autorizados
const ALLOWED_EMAILS = ['martin@azteclab.co', 'salomon@azteclab.co'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const pathname = req.nextUrl.pathname;
  
  // Crear cliente de Supabase para el middleware
  const supabase = createMiddlewareClient({ req, res });
  
  // Verificar si hay una sesión activa
  const { data: { session } } = await supabase.auth.getSession();
  
  // Rutas protegidas que requieren autenticación
  const isProtectedRoute = pathname.startsWith('/dashboard');
  
  // Rutas de autenticación que no deben ser accesibles si ya está autenticado
  const isAuthRoute = pathname === '/login';
  
  console.log('Middleware ejecutándose para:', pathname);
  console.log('Sesión presente:', session ? 'Sí' : 'No');
  
  // Si es una ruta protegida y no hay sesión, redirigir al login
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/login', req.url);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Si hay sesión, verificar que el correo esté autorizado
  if (session) {
    const userEmail = session.user.email;
    
    // Si el correo no está autorizado, cerrar sesión y redirigir al login
    if (!userEmail || !ALLOWED_EMAILS.includes(userEmail)) {
      // No podemos cerrar la sesión directamente desde el middleware
      // Redirigimos a una página que se encargará de cerrar la sesión
      const redirectUrl = new URL('/login?error=Acceso+denegado:+correo+no+autorizado', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Si está autenticado y trata de acceder a rutas de autenticación, redirigir al dashboard
    if (isAuthRoute) {
      const redirectUrl = new URL('/dashboard', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }
  
  return res;
}

// Configurar las rutas que deben ser verificadas por el middleware
// Excluimos /auth/callback para evitar interferir con el proceso de autenticación
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}; 