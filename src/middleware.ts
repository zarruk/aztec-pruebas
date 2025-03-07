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

export function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  
  // Redireccionar la página principal a /talleres
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/talleres', req.url));
  }
  
  console.log('Middleware ejecutándose para:', pathname);
  
  // Permitir acceso a todas las rutas
  return NextResponse.next();
}

// Configurar las rutas que deben ser verificadas por el middleware
export const config = {
  matcher: ['/', '/dashboard/:path*', '/login'],
}; 