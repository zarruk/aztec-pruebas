-- Añadir columna updated_at a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear o reemplazar la función que actualizará el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para la tabla usuarios
DROP TRIGGER IF EXISTS set_updated_at ON usuarios;
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Actualizar todos los registros existentes para establecer updated_at
UPDATE usuarios SET updated_at = NOW() WHERE updated_at IS NULL;

-- Comentario para documentar la columna
COMMENT ON COLUMN usuarios.updated_at IS 'Fecha y hora de la última actualización del usuario'; 