import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

export interface Session {
  userId: string;
  role: string;
  exp: number;
}

export async function createSession(userId: string, role: string): Promise<string> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  return token;
}

export async function getSession(request: NextRequest): Promise<Session | null> {
  const token = request.cookies.get('session')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as Session;
  } catch (error) {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
  });
}

export async function clearSession() {
  cookies().delete('session');
}

// Función para validar la sesión en el middleware
export async function validateSession(request: NextRequest): Promise<boolean> {
  const session = await getSession(request);
  
  if (!session) {
    return false;
  }

  // Verificar si la sesión ha expirado
  if (session.exp < Date.now() / 1000) {
    await clearSession();
    return false;
  }

  return true;
}

// Función para verificar si el usuario tiene un rol específico
export async function hasRole(request: NextRequest, role: string): Promise<boolean> {
  const session = await getSession(request);
  return session?.role === role;
}

// Función para obtener el ID del usuario actual
export async function getCurrentUserId(request: NextRequest): Promise<string | null> {
  const session = await getSession(request);
  return session?.userId || null;
} 