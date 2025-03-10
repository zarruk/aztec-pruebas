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
import { cookies } from 'next/headers';

// Contraseña para acceder al backoffice
const BACKOFFICE_PASSWORD = process.env.BACKOFFICE_PASSWORD || 'fact0rdiner0';

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = ['/backoffice'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Si no es una ruta protegida, permitir el acceso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Si es la página de login del backoffice, permitir el acceso
  if (pathname === '/backoffice/login') {
    return NextResponse.next();
  }
  
  // Obtener el token de la cookie
  const token = request.cookies.get('backoffice_auth_token')?.value;
  
  // Si no hay token, redirigir al login
  if (!token) {
    const url = new URL('/backoffice/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
  
  try {
    // Verificar el token (en este caso, simplemente comparamos con la contraseña)
    if (token !== BACKOFFICE_PASSWORD) {
      throw new Error('Token inválido');
    }
    
    // Token válido, permitir el acceso
    return NextResponse.next();
  } catch (error) {
    // Token inválido, redirigir al login
    const url = new URL('/backoffice/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

// Configurar el middleware para que solo se ejecute en las rutas especificadas
export const config = {
  matcher: ['/backoffice/:path*'],
}; 