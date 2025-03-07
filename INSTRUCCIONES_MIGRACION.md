# Instrucciones para corregir el problema con la columna referido_por

Se ha detectado un problema con la columna `referido_por` en la tabla `registros_talleres`. Actualmente, esta columna tiene una restricción de clave foránea que apunta a `usuarios(id)`, pero los valores que se están intentando insertar no existen en la tabla `usuarios`.

## Solución

Hemos implementado dos soluciones para resolver este problema:

### 1. Modificación del código de la API

Se ha actualizado el archivo `src/app/api/register/route.ts` para:

- Verificar si el referido existe en la tabla `usuarios` antes de intentar insertarlo
- Si el referido no existe, se establece como `null`
- Si falla la inserción con un referido, se intenta nuevamente sin referido

### 2. Migración de la base de datos

Para corregir la estructura de la base de datos, es necesario ejecutar la siguiente migración SQL. Puedes hacerlo a través del Editor SQL en el panel de administración de Supabase:

1. Inicia sesión en el panel de administración de Supabase
2. Ve a la sección "SQL Editor"
3. Crea una nueva consulta
4. Copia y pega el siguiente código SQL:

```sql
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
```

5. Ejecuta la consulta haciendo clic en el botón "Run"

## Verificación

Para verificar que la migración se ha aplicado correctamente, puedes ejecutar la siguiente consulta SQL:

```sql
SELECT 
  conname AS constraint_name,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'registros_talleres_referido_por_fkey';
```

Deberías ver que la restricción ahora incluye `ON DELETE SET NULL`. 