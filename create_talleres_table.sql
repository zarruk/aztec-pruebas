-- Crear la tabla de talleres
CREATE TABLE talleres (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('vivo', 'pregrabado')),
    fecha TIMESTAMPTZ,
    precio DECIMAL(10, 2),
    capacidad INTEGER,
    video_url VARCHAR(255),
    imagen_url VARCHAR(255),
    herramientas JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Crear la tabla de registros de talleres (para manejar las inscripciones)
CREATE TABLE registros_talleres (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    taller_id INTEGER REFERENCES talleres(id) ON DELETE CASCADE,
    estado VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'cancelado', 'completado')),
    fecha_registro TIMESTAMPTZ DEFAULT NOW(),
    fecha_confirmacion TIMESTAMPTZ,
    referido_por UUID REFERENCES auth.users(id),
    metodo_pago VARCHAR(50),
    monto_pagado DECIMAL(10, 2),
    notas TEXT,
    webhook_enviado BOOLEAN DEFAULT false,
    UNIQUE(usuario_id, taller_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX idx_talleres_tipo ON talleres(tipo);
CREATE INDEX idx_talleres_fecha ON talleres(fecha);
CREATE INDEX idx_registros_usuario ON registros_talleres(usuario_id);
CREATE INDEX idx_registros_taller ON registros_talleres(taller_id);
CREATE INDEX idx_registros_estado ON registros_talleres(estado);

-- Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_talleres_updated_at
    BEFORE UPDATE ON talleres
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Crear RLS (Row Level Security) policies
ALTER TABLE talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_talleres ENABLE ROW LEVEL SECURITY;

-- Política para talleres (todos pueden ver talleres activos)
CREATE POLICY "Talleres visibles para todos" ON talleres
    FOR SELECT USING (is_active = true);

-- Política para registros (usuarios solo ven sus propios registros)
CREATE POLICY "Usuarios ven sus propios registros" ON registros_talleres
    FOR SELECT USING (auth.uid() = usuario_id);

-- Comentarios en las tablas
COMMENT ON TABLE talleres IS 'Tabla que almacena la información de los talleres disponibles';
COMMENT ON TABLE registros_talleres IS 'Tabla que almacena los registros de usuarios a talleres'; 