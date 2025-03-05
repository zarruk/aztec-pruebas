-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
  id TEXT PRIMARY KEY, -- El ID será el número de teléfono
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de registros de talleres
CREATE TABLE IF NOT EXISTS registros_talleres (
  id SERIAL PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  taller_id INTEGER NOT NULL REFERENCES talleres(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado', 'completado')),
  datos_adicionales JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_telefono ON usuarios (telefono);
CREATE INDEX IF NOT EXISTS idx_registros_usuario_id ON registros_talleres (usuario_id);
CREATE INDEX IF NOT EXISTS idx_registros_taller_id ON registros_talleres (taller_id);
CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros_talleres (estado);

-- Permitir acceso anónimo para lectura y escritura en las nuevas tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_talleres ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Permitir lectura anónima de usuarios" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Permitir escritura anónima de usuarios" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización anónima de usuarios" ON usuarios
  FOR UPDATE USING (true);

-- Políticas para registros_talleres
CREATE POLICY "Permitir lectura anónima de registros_talleres" ON registros_talleres
  FOR SELECT USING (true);

CREATE POLICY "Permitir escritura anónima de registros_talleres" ON registros_talleres
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización anónima de registros_talleres" ON registros_talleres
  FOR UPDATE USING (true);

-- Comentarios para documentar las tablas
COMMENT ON TABLE usuarios IS 'Usuarios registrados en la plataforma';
COMMENT ON TABLE registros_talleres IS 'Registros de usuarios en talleres';

-- Comentarios para documentar las columnas
COMMENT ON COLUMN usuarios.id IS 'ID del usuario (número de teléfono)';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.email IS 'Correo electrónico del usuario';
COMMENT ON COLUMN usuarios.telefono IS 'Número de teléfono del usuario';

COMMENT ON COLUMN registros_talleres.usuario_id IS 'ID del usuario registrado';
COMMENT ON COLUMN registros_talleres.taller_id IS 'ID del taller al que se registró';
COMMENT ON COLUMN registros_talleres.estado IS 'Estado del registro: pendiente, confirmado, cancelado o completado';
COMMENT ON COLUMN registros_talleres.datos_adicionales IS 'Datos adicionales del registro en formato JSON'; 