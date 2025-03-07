-- Primero eliminamos la restricción de clave foránea existente
ALTER TABLE registros_talleres DROP CONSTRAINT IF EXISTS registros_talleres_referido_por_fkey;

-- Luego actualizamos la columna para permitir NULL y asegurarnos de que sea INTEGER
ALTER TABLE registros_talleres ALTER COLUMN referido_por TYPE INTEGER;
ALTER TABLE registros_talleres ALTER COLUMN referido_por DROP NOT NULL;

-- Finalmente, agregamos la restricción de clave foránea nuevamente, pero con la opción ON DELETE SET NULL
-- Esto significa que si se elimina un usuario referido, el campo referido_por se establecerá en NULL
ALTER TABLE registros_talleres ADD CONSTRAINT registros_talleres_referido_por_fkey 
  FOREIGN KEY (referido_por) REFERENCES usuarios(id) ON DELETE SET NULL;

-- Actualizamos los registros existentes que tienen referidos inválidos
UPDATE registros_talleres 
SET referido_por = NULL 
WHERE referido_por IS NOT NULL AND 
      NOT EXISTS (SELECT 1 FROM usuarios WHERE id = registros_talleres.referido_por);

-- Comentario para documentar el cambio
COMMENT ON COLUMN registros_talleres.referido_por IS 'ID del usuario que refirió este registro (puede ser NULL)'; 