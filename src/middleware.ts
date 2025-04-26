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
import { jwtVerify, SignJWT } from 'jose';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Configuración de rate limiting
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 intentos por 5 minutos
  analytics: true,
});

// Clave secreta para JWT (debe estar en variables de entorno)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

// Rutas protegidas que requieren autenticación
const PROTECTED_ROUTES = ['/backoffice'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta actual requiere autenticación
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );
  
  // Si no es una ruta protegida, permitir el acceso
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Si es la página de login del backoffice, aplicar rate limiting
  if (pathname === '/backoffice/login') {
    const ip = request.ip ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      });
    }
    
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
    // Verificar el token JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Verificar si el token ha expirado
    if (payload.exp && payload.exp < Date.now() / 1000) {
      throw new Error('Token expirado');
    }
    
    // Token válido, permitir el acceso
    return NextResponse.next();
  } catch (error) {
    // Token inválido o expirado, redirigir al login
    const url = new URL('/backoffice/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }
}

// Configurar el middleware para que solo se ejecute en las rutas especificadas
export const config = {
  matcher: ['/backoffice/:path*'],
}; 