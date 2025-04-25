-- Crear tabla de logs de seguridad
CREATE TABLE security_logs (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  details JSONB NOT NULL DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento de las consultas
CREATE INDEX idx_security_logs_event_type ON security_logs (event_type);
CREATE INDEX idx_security_logs_user_id ON security_logs (user_id);
CREATE INDEX idx_security_logs_ip_address ON security_logs (ip_address);
CREATE INDEX idx_security_logs_timestamp ON security_logs (timestamp);

-- Habilitar RLS
ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir solo lectura a administradores
CREATE POLICY "Permitir lectura de logs solo a administradores" ON security_logs
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

-- Política para permitir inserción al sistema
CREATE POLICY "Permitir inserción de logs al sistema" ON security_logs
  FOR INSERT WITH CHECK (true);

-- Comentarios para documentación
COMMENT ON TABLE security_logs IS 'Registro de eventos de seguridad del sistema';
COMMENT ON COLUMN security_logs.event_type IS 'Tipo de evento de seguridad';
COMMENT ON COLUMN security_logs.user_id IS 'ID del usuario relacionado con el evento';
COMMENT ON COLUMN security_logs.ip_address IS 'Dirección IP desde donde se originó el evento';
COMMENT ON COLUMN security_logs.user_agent IS 'User Agent del navegador o cliente';
COMMENT ON COLUMN security_logs.details IS 'Detalles adicionales del evento en formato JSON';
COMMENT ON COLUMN security_logs.timestamp IS 'Fecha y hora del evento'; 