-- Políticas de seguridad para la tabla herramientas
ALTER TABLE herramientas ENABLE ROW LEVEL SECURITY;

-- Política de lectura para herramientas (acceso público)
CREATE POLICY "Permitir lectura pública de herramientas" ON herramientas
  FOR SELECT USING (true);

-- Política de escritura para herramientas (solo administradores)
CREATE POLICY "Permitir escritura de herramientas solo a administradores" ON herramientas
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Políticas de seguridad para la tabla talleres
ALTER TABLE talleres ENABLE ROW LEVEL SECURITY;

-- Política de lectura para talleres (acceso público)
CREATE POLICY "Permitir lectura pública de talleres" ON talleres
  FOR SELECT USING (true);

-- Política de escritura para talleres (solo administradores)
CREATE POLICY "Permitir escritura de talleres solo a administradores" ON talleres
  FOR ALL USING (
    auth.role() = 'authenticated' AND 
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Políticas de seguridad para la tabla usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- Política de lectura para usuarios (solo el propio usuario y administradores)
CREATE POLICY "Permitir lectura de usuarios" ON usuarios
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Política de escritura para usuarios (solo el propio usuario y administradores)
CREATE POLICY "Permitir escritura de usuarios" ON usuarios
  FOR ALL USING (
    auth.uid() = id OR 
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Políticas de seguridad para la tabla registros_talleres
ALTER TABLE registros_talleres ENABLE ROW LEVEL SECURITY;

-- Política de lectura para registros (usuario ve sus propios registros, admin ve todos)
CREATE POLICY "Permitir lectura de registros" ON registros_talleres
  FOR SELECT USING (
    auth.uid() = usuario_id OR 
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Política de escritura para registros (usuario puede crear sus propios registros)
CREATE POLICY "Permitir creación de registros" ON registros_talleres
  FOR INSERT WITH CHECK (
    auth.uid() = usuario_id
  );

-- Política de actualización para registros (solo administradores)
CREATE POLICY "Permitir actualización de registros solo a administradores" ON registros_talleres
  FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Política de eliminación para registros (solo administradores)
CREATE POLICY "Permitir eliminación de registros solo a administradores" ON registros_talleres
  FOR DELETE USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Crear tabla de administradores
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Política de seguridad para la tabla admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Solo los administradores pueden ver la lista de administradores
CREATE POLICY "Permitir lectura de admin_users solo a administradores" ON admin_users
  FOR SELECT USING (
    auth.uid() IN (SELECT user_id FROM admin_users)
  );

-- Solo los superadministradores pueden modificar la lista de administradores
CREATE POLICY "Permitir escritura de admin_users solo a superadministradores" ON admin_users
  FOR ALL USING (
    auth.uid() IN (SELECT user_id FROM admin_users WHERE is_superadmin = true)
  ); 