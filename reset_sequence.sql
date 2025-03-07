-- Script para resetear la secuencia de IDs en la tabla de talleres
-- Ejecutar esto en la consola SQL de Supabase

-- Obtener el ID máximo actual
SELECT MAX(id) FROM talleres;

-- Resetear la secuencia al valor máximo + 1
-- Reemplaza 'X' con el valor máximo obtenido en el paso anterior
SELECT setval('talleres_id_seq', X, true);

-- Verificar que la secuencia se haya reseteado correctamente
SELECT nextval('talleres_id_seq'); 