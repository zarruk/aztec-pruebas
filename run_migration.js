const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' });

// Inicializar cliente de Supabase con la clave de servicio
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('Iniciando migración de la tabla usuarios...');
    
    // Leer el archivo SQL
    const sqlFilePath = path.join(__dirname, 'migrations', 'update_usuarios_id.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    // Ejecutar la migración
    const { error } = await supabase.rpc('exec_sql', { sql: sqlContent });
    
    if (error) {
      console.error('Error al ejecutar la migración:', error);
      process.exit(1);
    }
    
    console.log('Migración completada exitosamente');
  } catch (err) {
    console.error('Error inesperado:', err);
    process.exit(1);
  }
}

runMigration(); 