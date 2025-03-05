-- Añadir columnas capacidad y precio a la tabla talleres
ALTER TABLE talleres ADD COLUMN capacidad INTEGER;
ALTER TABLE talleres ADD COLUMN precio INTEGER;

-- Actualizar comentarios para documentar las nuevas columnas
COMMENT ON COLUMN talleres.capacidad IS 'Capacidad máxima de participantes en el taller';
COMMENT ON COLUMN talleres.precio IS 'Precio del taller en la moneda local'; 