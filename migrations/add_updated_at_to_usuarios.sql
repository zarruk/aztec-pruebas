-- Añadir columna ultima_actualizacion a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS ultima_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Crear o reemplazar la función que actualizará el campo ultima_actualizacion
CREATE OR REPLACE FUNCTION update_ultima_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.ultima_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para la tabla usuarios
DROP TRIGGER IF EXISTS set_ultima_actualizacion ON usuarios;
CREATE TRIGGER set_ultima_actualizacion
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_ultima_actualizacion_column();

-- Actualizar todos los registros existentes para establecer ultima_actualizacion
UPDATE usuarios SET ultima_actualizacion = NOW() WHERE ultima_actualizacion IS NULL;

-- Comentario para documentar la columna
COMMENT ON COLUMN usuarios.ultima_actualizacion IS 'Fecha y hora de la última actualización del usuario'; 