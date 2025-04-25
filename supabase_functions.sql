-- Función para insertar un taller con ID explícito
CREATE OR REPLACE FUNCTION insert_taller_with_id(
  taller_id INT,
  taller_nombre TEXT,
  taller_descripcion TEXT,
  taller_tipo TEXT,
  taller_video_url TEXT,
  taller_capacidad INT,
  taller_precio NUMERIC,
  taller_herramientas INT[],
  taller_imagen_url TEXT,
  taller_fecha TIMESTAMPTZ
) RETURNS BOOLEAN AS $$
BEGIN
  -- Insertar el taller con el ID explícito
  INSERT INTO talleres (
    id, 
    nombre, 
    descripcion, 
    tipo, 
    video_url, 
    capacidad, 
    precio, 
    herramientas, 
    imagen_url, 
    fecha
  ) VALUES (
    taller_id,
    taller_nombre,
    taller_descripcion,
    taller_tipo,
    taller_video_url,
    taller_capacidad,
    taller_precio,
    taller_herramientas,
    taller_imagen_url,
    taller_fecha
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error al insertar taller: %', SQLERRM;
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Permitir lectura anónima de herramientas" ON herramientas;
DROP POLICY IF EXISTS "Permitir escritura anónima de herramientas" ON herramientas;
DROP POLICY IF EXISTS "Permitir actualización anónima de herramientas" ON herramientas;
DROP POLICY IF EXISTS "Permitir eliminación anónima de herramientas" ON herramientas;
DROP POLICY IF EXISTS "Permitir lectura anónima de talleres" ON talleres;
DROP POLICY IF EXISTS "Permitir escritura anónima de talleres" ON talleres;
DROP POLICY IF EXISTS "Permitir actualización anónima de talleres" ON talleres;
DROP POLICY IF EXISTS "Permitir eliminación anónima de talleres" ON talleres;

-- Políticas para herramientas
CREATE POLICY "Permitir lectura pública de herramientas" ON herramientas
  FOR SELECT USING (true);

CREATE POLICY "Permitir escritura solo a administradores" ON herramientas
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

CREATE POLICY "Permitir actualización solo a administradores" ON herramientas
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

CREATE POLICY "Permitir eliminación solo a administradores" ON herramientas
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

-- Políticas para talleres
CREATE POLICY "Permitir lectura pública de talleres" ON talleres
  FOR SELECT USING (true);

CREATE POLICY "Permitir escritura solo a administradores" ON talleres
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

CREATE POLICY "Permitir actualización solo a administradores" ON talleres
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

CREATE POLICY "Permitir eliminación solo a administradores" ON talleres
  FOR DELETE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

-- Políticas para usuarios
CREATE POLICY "Permitir lectura de usuarios solo a administradores" ON usuarios
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

CREATE POLICY "Permitir actualización de usuarios solo a administradores" ON usuarios
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

-- Políticas para registros_talleres
CREATE POLICY "Permitir lectura de registros solo a administradores" ON registros_talleres
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

CREATE POLICY "Permitir escritura de registros a usuarios autenticados" ON registros_talleres
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND 
    usuario_id = auth.uid()
  );

CREATE POLICY "Permitir actualización de registros solo a administradores" ON registros_talleres
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT id FROM usuarios WHERE es_admin = true)
  );

-- Agregar columna es_admin a la tabla usuarios si no existe
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'usuarios' AND column_name = 'es_admin'
  ) THEN
    ALTER TABLE usuarios ADD COLUMN es_admin BOOLEAN DEFAULT false;
  END IF;
END $$; 