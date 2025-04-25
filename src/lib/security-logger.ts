import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DELETE = 'FILE_DELETE',
  ADMIN_ACTION = 'ADMIN_ACTION',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
}

export interface SecurityLog {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address?: string;
  user_agent?: string;
  details: Record<string, any>;
  timestamp: Date;
}

export async function logSecurityEvent(
  event: Omit<SecurityLog, 'timestamp'>
): Promise<void> {
  try {
    const logEntry: SecurityLog = {
      ...event,
      timestamp: new Date(),
    };

    const { error } = await supabase
      .from('security_logs')
      .insert([logEntry]);

    if (error) {
      console.error('Error al registrar evento de seguridad:', error);
    }
  } catch (error) {
    console.error('Error al registrar evento de seguridad:', error);
  }
}

export async function getSecurityLogs(
  filters: Partial<SecurityLog> = {},
  limit: number = 100
): Promise<SecurityLog[]> {
  try {
    let query = supabase
      .from('security_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    // Aplicar filtros
    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }
    if (filters.ip_address) {
      query = query.eq('ip_address', filters.ip_address);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener logs de seguridad:', error);
      return [];
    }

    return data as SecurityLog[];
  } catch (error) {
    console.error('Error al obtener logs de seguridad:', error);
    return [];
  }
}

// Función para detectar actividad sospechosa
export async function detectSuspiciousActivity(
  userId: string,
  ipAddress: string
): Promise<boolean> {
  try {
    // Obtener eventos recientes del usuario
    const recentEvents = await getSecurityLogs({
      user_id: userId,
    }, 10);

    // Contar intentos fallidos de login
    const failedLogins = recentEvents.filter(
      event => event.event_type === SecurityEventType.LOGIN_FAILURE
    ).length;

    // Verificar si hay múltiples intentos fallidos
    if (failedLogins >= 5) {
      await logSecurityEvent({
        event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
        user_id: userId,
        ip_address: ipAddress,
        details: {
          reason: 'Multiple failed login attempts',
          failed_attempts: failedLogins,
        },
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error al detectar actividad sospechosa:', error);
    return false;
  }
} 