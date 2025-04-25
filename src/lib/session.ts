import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long'
);

export interface Session {
  userId: string;
  email: string;
  isAdmin: boolean;
  exp: number;
}

export async function createSession(userId: string, email: string, isAdmin: boolean): Promise<string> {
  const token = await new SignJWT({ userId, email, isAdmin })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  // Configurar cookie segura
  cookies().set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 horas
  });

  return token;
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get('session')?.value;

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

export async function destroySession() {
  cookies().delete('session');
}

export async function validateSession(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;

  // Verificar expiración
  if (session.exp < Math.floor(Date.now() / 1000)) {
    await destroySession();
    return false;
  }

  return true;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('No autorizado');
  }
  return session;
}

export async function requireAdmin() {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    throw new Error('Acceso denegado');
  }
  return session;
} 