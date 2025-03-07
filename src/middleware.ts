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
  console.log('Middleware ejecutándose para:', req.nextUrl.pathname);
  return NextResponse.next();
}

// Configurar las rutas que deben ser verificadas por el middleware
// Excluimos /auth/callback para evitar interferir con el proceso de autenticación
export const config = {
  matcher: ['/dashboard/:path*', '/login'],
}; 