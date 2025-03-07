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