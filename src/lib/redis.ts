import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Configuración de Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || '',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
});

// Configuración de rate limiting
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '5 m'), // 5 intentos por 5 minutos
  analytics: true,
});

// Función para verificar el rate limit
export async function checkRateLimit(identifier: string) {
  try {
    const { success, limit, reset, remaining } = await ratelimit.limit(identifier);
    
    return {
      success,
      limit,
      reset,
      remaining,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    };
  } catch (error) {
    console.error('Error en rate limiting:', error);
    return {
      success: false,
      limit: 0,
      reset: 0,
      remaining: 0,
      headers: {},
    };
  }
} 