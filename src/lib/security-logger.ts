import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export enum SecurityEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILURE = 'LOGIN_FAILURE',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',
  FILE_UPLOAD = 'FILE_UPLOAD',
  FILE_DELETE = 'FILE_DELETE',
  PERMISSION_CHANGE = 'PERMISSION_CHANGE',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  SQL_INJECTION_ATTEMPT = 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT = 'XSS_ATTEMPT',
  CSRF_ATTEMPT = 'CSRF_ATTEMPT'
}

export interface SecurityLog {
  event_type: SecurityEventType;
  user_id?: string;
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
}

export async function logSecurityEvent(
  event: Omit<SecurityLog, 'timestamp'>
): Promise<void> {
  try {
    const { error } = await supabase
      .from('security_logs')
      .insert({
        ...event,
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('Error al registrar evento de seguridad:', error);
    }
  } catch (error) {
    console.error('Error al registrar evento de seguridad:', error);
  }
}

export async function getSecurityLogs(
  filters: {
    event_type?: SecurityEventType;
    user_id?: string;
    severity?: SecurityLog['severity'];
    start_date?: Date;
    end_date?: Date;
  } = {},
  limit: number = 100
): Promise<SecurityLog[]> {
  try {
    let query = supabase
      .from('security_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }

    if (filters.user_id) {
      query = query.eq('user_id', filters.user_id);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.start_date) {
      query = query.gte('timestamp', filters.start_date.toISOString());
    }

    if (filters.end_date) {
      query = query.lte('timestamp', filters.end_date.toISOString());
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

// Función para detectar patrones sospechosos
export function detectSuspiciousPatterns(logs: SecurityLog[]): SecurityLog[] {
  const suspiciousLogs: SecurityLog[] = [];

  // Detectar múltiples intentos fallidos de login
  const loginFailures = logs.filter(log => log.event_type === SecurityEventType.LOGIN_FAILURE);
  if (loginFailures.length >= 5) {
    suspiciousLogs.push({
      ...loginFailures[0],
      event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'HIGH',
      details: {
        ...loginFailures[0].details,
        failed_attempts: loginFailures.length
      }
    });
  }

  // Detectar múltiples intentos de SQL injection
  const sqlInjectionAttempts = logs.filter(log => log.event_type === SecurityEventType.SQL_INJECTION_ATTEMPT);
  if (sqlInjectionAttempts.length > 0) {
    suspiciousLogs.push({
      ...sqlInjectionAttempts[0],
      event_type: SecurityEventType.SUSPICIOUS_ACTIVITY,
      severity: 'CRITICAL',
      details: {
        ...sqlInjectionAttempts[0].details,
        attempt_count: sqlInjectionAttempts.length
      }
    });
  }

  return suspiciousLogs;
}

// Función para generar alertas de seguridad
export async function generateSecurityAlerts(logs: SecurityLog[]): Promise<void> {
  const suspiciousLogs = detectSuspiciousPatterns(logs);

  for (const log of suspiciousLogs) {
    // Aquí se implementaría la lógica para enviar alertas
    // Por ejemplo, enviar un email, notificación push, etc.
    console.log('Alerta de seguridad:', {
      type: log.event_type,
      severity: log.severity,
      details: log.details
    });
  }
} 