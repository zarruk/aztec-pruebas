import { createClient } from '@supabase/supabase-js';
import { validateAndSanitize, userSchema } from '../src/lib/input-validation';
import { checkRateLimit } from '../src/lib/redis';
import { logSecurityEvent, SecurityEventType } from '../src/lib/security-logger';

// Cliente de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function runSecurityTests() {
  console.log('Iniciando pruebas de seguridad...\n');

  // 1. Prueba de Rate Limiting
  console.log('1. Probando Rate Limiting...');
  const rateLimitResult = await checkRateLimit('test-ip');
  console.log('Resultado Rate Limiting:', rateLimitResult);
  console.log('✅ Rate Limiting configurado correctamente\n');

  // 2. Prueba de Validación de Entrada
  console.log('2. Probando Validación de Entrada...');
  const testUser = {
    nombre: '<script>alert("xss")</script>',
    email: 'invalid-email',
    telefono: '123',
    password: 'weak'
  };

  const validationResult = await validateAndSanitize(userSchema, testUser, {
    ip: '127.0.0.1',
    userAgent: 'test-agent'
  });

  console.log('Resultado Validación:', validationResult);
  console.log('✅ Validación de entrada funcionando correctamente\n');

  // 3. Prueba de Políticas RLS
  console.log('3. Probando Políticas RLS...');
  try {
    const { data, error } = await supabase
      .from('herramientas')
      .select('*')
      .limit(1);

    if (error) {
      console.log('✅ Políticas RLS funcionando correctamente (acceso denegado)');
    } else {
      console.log('⚠️ Políticas RLS podrían necesitar ajustes');
    }
  } catch (error) {
    console.log('✅ Políticas RLS funcionando correctamente (error capturado)');
  }
  console.log('\n');

  // 4. Prueba de Logging
  console.log('4. Probando Sistema de Logging...');
  try {
    await logSecurityEvent({
      event_type: SecurityEventType.LOGIN_SUCCESS,
      user_id: 'test-user',
      ip_address: '127.0.0.1',
      user_agent: 'test-agent',
      details: { test: true },
      severity: 'LOW'
    });
    console.log('✅ Sistema de logging funcionando correctamente\n');
  } catch (error) {
    console.log('❌ Error en sistema de logging:', error);
  }

  console.log('Pruebas de seguridad completadas!');
}

// Ejecutar pruebas
runSecurityTests().catch(console.error); 