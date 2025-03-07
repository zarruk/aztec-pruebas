-- Migración para actualizar la tabla talleres
-- Eliminar las columnas fecha_vivo y fecha_live_build, y agregar la columna fecha

-- Primero, agregar la nueva columna fecha
ALTER TABLE talleres ADD COLUMN fecha TIMESTAMP WITH TIME ZONE;

-- Actualizar la columna fecha con los valores de fecha_vivo o fecha_live_build según el tipo de taller
UPDATE talleres SET fecha = fecha_vivo WHERE tipo = 'vivo';
UPDATE talleres SET fecha = fecha_live_build WHERE tipo = 'live_build';
UPDATE talleres SET fecha = NOW() WHERE fecha IS NULL;

-- Hacer que la columna fecha sea NOT NULL
ALTER TABLE talleres ALTER COLUMN fecha SET NOT NULL;

-- Eliminar las columnas antiguas
ALTER TABLE talleres DROP COLUMN fecha_vivo;
ALTER TABLE talleres DROP COLUMN fecha_live_build;

-- Agregar comentario a la columna fecha
COMMENT ON COLUMN talleres.fecha IS 'Fecha en la que se realizará el taller, independiente del tipo'; 