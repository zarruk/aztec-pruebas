-- Crear una tabla temporal con la nueva estructura
CREATE TABLE usuarios_temp (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copiar los datos de la tabla original a la temporal
INSERT INTO usuarios_temp (nombre, email, telefono, created_at)
SELECT nombre, email, telefono, created_at FROM usuarios;

-- Eliminar la tabla original
DROP TABLE usuarios CASCADE;

-- Renombrar la tabla temporal a usuarios
ALTER TABLE usuarios_temp RENAME TO usuarios;

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_usuarios_telefono ON usuarios (telefono);
CREATE INDEX idx_usuarios_email ON usuarios (email);

-- Comentarios para documentar la tabla
COMMENT ON TABLE usuarios IS 'Usuarios registrados en la plataforma';
COMMENT ON COLUMN usuarios.id IS 'ID único generado automáticamente';
COMMENT ON COLUMN usuarios.nombre IS 'Nombre completo del usuario';
COMMENT ON COLUMN usuarios.email IS 'Correo electrónico del usuario';
COMMENT ON COLUMN usuarios.telefono IS 'Número de teléfono del usuario';
COMMENT ON COLUMN usuarios.created_at IS 'Fecha y hora de creación del registro'; 