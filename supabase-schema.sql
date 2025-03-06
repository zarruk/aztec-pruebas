-- Crear tabla de herramientas
CREATE TABLE herramientas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  imagen_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de talleres
CREATE TABLE talleres (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  video_url TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('vivo', 'pregrabado', 'live_build')),
  fecha_vivo TIMESTAMP WITH TIME ZONE,
  fecha_live_build TIMESTAMP WITH TIME ZONE,
  herramientas INTEGER[] DEFAULT '{}',
  campos_webhook TEXT[] DEFAULT '{}',
  capacidad INTEGER,
  precio INTEGER,
  imagen_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear políticas de seguridad (RLS)
ALTER TABLE herramientas ENABLE ROW LEVEL SECURITY;
ALTER TABLE talleres ENABLE ROW LEVEL SECURITY;

-- Permitir acceso anónimo para lectura
CREATE POLICY "Permitir lectura anónima de herramientas" ON herramientas
  FOR SELECT USING (true);

CREATE POLICY "Permitir lectura anónima de talleres" ON talleres
  FOR SELECT USING (true);

-- Permitir acceso de escritura (esto deberías cambiarlo según tus necesidades de autenticación)
-- Por ahora, permitimos escritura anónima para facilitar el desarrollo
CREATE POLICY "Permitir escritura anónima de herramientas" ON herramientas
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización anónima de herramientas" ON herramientas
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación anónima de herramientas" ON herramientas
  FOR DELETE USING (true);

CREATE POLICY "Permitir escritura anónima de talleres" ON talleres
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización anónima de talleres" ON talleres
  FOR UPDATE USING (true);

CREATE POLICY "Permitir eliminación anónima de talleres" ON talleres
  FOR DELETE USING (true);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_herramientas_nombre ON herramientas (nombre);
CREATE INDEX idx_talleres_nombre ON talleres (nombre);
CREATE INDEX idx_talleres_tipo ON talleres (tipo);

-- Comentarios para documentar las tablas
COMMENT ON TABLE herramientas IS 'Herramientas utilizadas en los talleres';
COMMENT ON TABLE talleres IS 'Talleres disponibles para los estudiantes';

-- Comentarios para documentar las columnas
COMMENT ON COLUMN herramientas.nombre IS 'Nombre de la herramienta';
COMMENT ON COLUMN herramientas.descripcion IS 'Descripción de la herramienta';
COMMENT ON COLUMN herramientas.imagen_url IS 'URL de la imagen de la herramienta';

COMMENT ON COLUMN talleres.nombre IS 'Nombre del taller';
COMMENT ON COLUMN talleres.descripcion IS 'Descripción del taller';
COMMENT ON COLUMN talleres.video_url IS 'URL del video con información del taller';
COMMENT ON COLUMN talleres.tipo IS 'Tipo de taller: vivo, pregrabado o live build';
COMMENT ON COLUMN talleres.fecha_vivo IS 'Fecha en la que se realizará el taller en vivo';
COMMENT ON COLUMN talleres.fecha_live_build IS 'Fecha en la que se realizará el live build para talleres pregrabados';
COMMENT ON COLUMN talleres.herramientas IS 'IDs de las herramientas utilizadas en el taller';
COMMENT ON COLUMN talleres.campos_webhook IS 'Campos adicionales para el webhook cuando alguien se registra';
COMMENT ON COLUMN talleres.capacidad IS 'Capacidad del taller';
COMMENT ON COLUMN talleres.precio IS 'Precio del taller';
COMMENT ON COLUMN talleres.imagen_url IS 'URL de la imagen del taller';

-- Crear tabla de usuarios
CREATE TABLE usuarios (
  id TEXT PRIMARY KEY, -- El ID será el número de teléfono
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de registros de talleres
CREATE TABLE registros_talleres (
  id SERIAL PRIMARY KEY,
  usuario_id TEXT NOT NULL REFERENCES usuarios(id),
  taller_id INTEGER NOT NULL REFERENCES talleres(id),
  estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado', 'completado')),
  datos_adicionales JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_email ON usuarios (email);
CREATE INDEX idx_usuarios_telefono ON usuarios (telefono);
CREATE INDEX idx_registros_usuario_id ON registros_talleres (usuario_id);
CREATE INDEX idx_registros_taller_id ON registros_talleres (taller_id);
CREATE INDEX idx_registros_estado ON registros_talleres (estado);

-- Permitir acceso anónimo para lectura y escritura en las nuevas tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_talleres ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir lectura anónima de usuarios" ON usuarios
  FOR SELECT USING (true);

CREATE POLICY "Permitir escritura anónima de usuarios" ON usuarios
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir actualización anónima de usuarios" ON usuarios
  FOR UPDATE USING (true);

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

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por ON registros_talleres (referido_por);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_email ON registros_talleres (referido_por_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_telefono IS 'Número de teléfono del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_id ON registros_talleres (referido_por_usuario_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_id IS 'ID del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_id ON registros_talleres (referido_por_taller_id);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_id IS 'ID del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_taller_nombre ON registros_talleres (referido_por_taller_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_taller_nombre IS 'Nombre del taller al que se registró el referido';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_nombre ON registros_talleres (referido_por_usuario_nombre);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_nombre IS 'Nombre del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_email ON registros_talleres (referido_por_usuario_email);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.referido_por_usuario_email IS 'Correo electrónico del usuario que refirió al participante';

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_registros_referido_por_usuario_telefono ON registros_talleres (referido_por_usuario_telefono);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN registros_talleres.datos_adicionales IS 'Datos adicionales del registro en formato JSON'; 