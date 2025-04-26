import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Lista de orígenes permitidos
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://aztec-nuevo.onrender.com',
  // Agrega aquí otros orígenes permitidos
];

// Lista de métodos HTTP permitidos
const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'];

// Lista de headers permitidos
const ALLOWED_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'X-CSRF-Token',
];

// Tiempo máximo de cache para las respuestas preflight
const MAX_AGE = 86400; // 24 horas

export function corsMiddleware(request: NextRequest) {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  // Headers de respuesta CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
    'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
    'Access-Control-Max-Age': MAX_AGE.toString(),
    'Access-Control-Allow-Credentials': 'true',
  };

  // Si es una solicitud OPTIONS (preflight), responder inmediatamente
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Para otras solicitudes, agregar los headers CORS a la respuesta
  const response = NextResponse.next();
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Función para validar el origen de una solicitud
export function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin);
}

// Función para validar el método HTTP
export function validateMethod(method: string): boolean {
  return ALLOWED_METHODS.includes(method);
}

// Función para validar los headers de la solicitud
export function validateHeaders(headers: Headers): boolean {
  const requestHeaders = Array.from(headers.keys());
  return requestHeaders.every(header => 
    ALLOWED_HEADERS.includes(header) || 
    header.toLowerCase().startsWith('x-')
  );
}

// Función para configurar CORS en una ruta específica
export function configureCors(handler: Function) {
  return async (request: NextRequest) => {
    // Validar origen
    const origin = request.headers.get('origin');
    if (!validateOrigin(origin)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Validar método
    if (!validateMethod(request.method)) {
      return new NextResponse('Method Not Allowed', { status: 405 });
    }

    // Validar headers
    if (!validateHeaders(request.headers)) {
      return new NextResponse('Bad Request', { status: 400 });
    }

    // Procesar la solicitud
    const response = await handler(request);

    // Agregar headers CORS a la respuesta
    const corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': ALLOWED_HEADERS.join(', '),
      'Access-Control-Max-Age': MAX_AGE.toString(),
      'Access-Control-Allow-Credentials': 'true',
    };

    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  };
} 