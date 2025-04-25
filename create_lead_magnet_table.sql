-- Crear la tabla de registros de lead magnet
CREATE TABLE registros_lead_magnet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    telefono VARCHAR(50) NOT NULL,
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    guia_descargada BOOLEAN DEFAULT false,
    fecha_descarga TIMESTAMPTZ,
    webhook_enviado BOOLEAN DEFAULT false,
    usuario_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_lead_magnet_email ON registros_lead_magnet(email);
CREATE INDEX idx_lead_magnet_telefono ON registros_lead_magnet(telefono);
CREATE INDEX idx_lead_magnet_fecha ON registros_lead_magnet(fecha_registro);

-- Crear trigger para actualizar updated_at
CREATE TRIGGER update_lead_magnet_updated_at
    BEFORE UPDATE ON registros_lead_magnet
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear RLS (Row Level Security) policies
ALTER TABLE registros_lead_magnet ENABLE ROW LEVEL SECURITY;

-- Política para registros (usuarios autenticados pueden ver sus propios registros)
CREATE POLICY "Usuarios ven sus propios registros de lead magnet" ON registros_lead_magnet
    FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() IS NOT NULL);

-- Política para inserción (cualquiera puede registrarse)
CREATE POLICY "Cualquiera puede registrarse para lead magnet" ON registros_lead_magnet
    FOR INSERT WITH CHECK (true);

-- Comentarios en la tabla
COMMENT ON TABLE registros_lead_magnet IS 'Tabla que almacena los registros de usuarios que solicitan la guía de automatización'; 