import { z } from 'zod';
import { SecurityEventType, logSecurityEvent } from './security-logger';

// Esquemas de validación para diferentes tipos de datos
export const userSchema = z.object({
  nombre: z.string().min(2).max(100),
  email: z.string().email(),
  telefono: z.string().regex(/^\+?[1-9]\d{1,14}$/), // Formato E.164
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
});

export const tallerSchema = z.object({
  nombre: z.string().min(2).max(200),
  descripcion: z.string().min(10).max(1000),
  video_url: z.string().url(),
  tipo: z.enum(['vivo', 'pregrabado', 'live_build']),
  fecha: z.string().datetime(),
  herramientas: z.array(z.number()),
  campos_webhook: z.array(z.string()),
  capacidad: z.number().int().positive().optional(),
  precio: z.number().int().nonnegative().optional(),
  imagen_url: z.string().url().optional(),
});

export const herramientaSchema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().min(10).max(500),
  imagen_url: z.string().url(),
});

// Función para sanitizar strings
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remover tags HTML
    .replace(/javascript:/gi, '') // Remover javascript: URLs
    .replace(/on\w+=/gi, '') // Remover event handlers
    .trim();
}

// Función para validar y sanitizar datos
export async function validateAndSanitize<T>(
  schema: z.Schema<T>,
  data: unknown,
  context: { ip: string; userAgent: string; userId?: string }
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    // Intentar validar con el esquema
    const validatedData = await schema.parseAsync(data);

    // Si los datos son un objeto, sanitizar strings
    if (typeof validatedData === 'object' && validatedData !== null) {
      Object.keys(validatedData).forEach(key => {
        if (typeof validatedData[key] === 'string') {
          validatedData[key] = sanitizeString(validatedData[key]);
        }
      });
    }

    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Registrar intento de validación fallido
      await logSecurityEvent({
        event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        user_id: context.userId,
        ip_address: context.ip,
        user_agent: context.userAgent,
        details: {
          validation_errors: error.errors,
          input_data: data
        },
        severity: 'LOW'
      });

      return {
        success: false,
        error: 'Datos de entrada inválidos: ' + error.errors.map(e => e.message).join(', ')
      };
    }

    return {
      success: false,
      error: 'Error al validar los datos'
    };
  }
}

// Función para validar IDs
export function validateId(id: unknown): boolean {
  if (typeof id === 'number') {
    return Number.isInteger(id) && id > 0;
  }
  if (typeof id === 'string') {
    return /^[0-9]+$/.test(id) && parseInt(id) > 0;
  }
  return false;
}

// Función para validar URLs
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Función para validar fechas
export function validateDate(date: string): boolean {
  const timestamp = Date.parse(date);
  return !isNaN(timestamp) && timestamp > 0;
}

// Función para validar números
export function validateNumber(value: unknown, min?: number, max?: number): boolean {
  if (typeof value !== 'number') return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

// Función para detectar patrones de SQL injection
export function detectSqlInjection(input: string): boolean {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
  ];

  return sqlInjectionPatterns.some(pattern => pattern.test(input));
}

// Función para detectar patrones de XSS
export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script[^>]*>[\s\S]*?<\/script>/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<img[^>]+src\s*=\s*["']\s*javascript:/i,
    /<iframe[^>]*>[\s\S]*?<\/iframe>/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
} 