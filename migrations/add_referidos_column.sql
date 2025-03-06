-- Agregar columna referido_por a la tabla registros_talleres
ALTER TABLE registros_talleres ADD COLUMN referido_por INTEGER REFERENCES usuarios(id);

-- Crear índice para mejorar el rendimiento de las consultas
CREATE INDEX idx_registros_referido_por ON registros_talleres(referido_por); 