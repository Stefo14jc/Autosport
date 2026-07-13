CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE rol_usuario AS ENUM ('admin', 'bodeguero');
CREATE TYPE tipo_movimiento AS ENUM ('ingreso', 'salida');

-- 1. Crear secuencia para los códigos automáticos de accesorios
CREATE SEQUENCE IF NOT EXISTS accesorios_codigo_seq;

CREATE TABLE usuarios (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  rol         rol_usuario NOT NULL DEFAULT 'bodeguero',
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categorias (
  id          SERIAL PRIMARY KEY,
  nombre      VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE accesorios (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo          VARCHAR(50) UNIQUE NOT NULL DEFAULT 'REP-' || LPAD(nextval('accesorios_codigo_seq')::text, 5, '0'),
  nombre          VARCHAR(150) NOT NULL,
  descripcion     TEXT,
  categoria_id    INT REFERENCES categorias(id) ON DELETE SET NULL,
  precio_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0,
  stock_actual    INT NOT NULL DEFAULT 0,
  stock_minimo    INT NOT NULL DEFAULT 5,
  ubicacion       VARCHAR(100),
  imagen_url      TEXT,
  activo          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE movimientos_stock (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accesorio_id     UUID NOT NULL REFERENCES accesorios(id) ON DELETE CASCADE,
  usuario_id      UUID NOT NULL REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo            tipo_movimiento NOT NULL,
  cantidad        INT NOT NULL CHECK (cantidad > 0),
  stock_anterior  INT NOT NULL,
  stock_nuevo     INT NOT NULL,
  motivo          TEXT,
  origen_qr       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accesorios_codigo    ON accesorios(codigo);
CREATE INDEX idx_accesorios_nombre    ON accesorios(nombre);
CREATE INDEX idx_mov_accesorio        ON movimientos_stock(accesorio_id);
CREATE INDEX idx_mov_fecha           ON movimientos_stock(created_at DESC);

CREATE OR REPLACE FUNCTION actualizar_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_accesorios_updated_at
  BEFORE UPDATE ON accesorios
  FOR EACH ROW EXECUTE FUNCTION actualizar_updated_at();

-- =================================================================
-- DATOS INICIALES SEMILLA (Estrictamente necesarios para arrancar)
-- =================================================================

-- Categorías base para tu negocio AutoSport
-- Cambia las categorías por cosas de accesorios:
INSERT INTO categorias (nombre) VALUES
  ('Iluminación'),        -- (Luces LED, neblineros, faros)
  ('Audio y Video'),      -- (Radios de pantalla, parlantes, amplificadores)
  ('Estética y Limpieza'),-- (Ceras, ambientadores, paños microfibra)
  ('Lujos y Confort'),    -- (Forros de asientos, cubiertas de volante, moquetas)
  ('Seguridad'),          -- (Alarmas, trabavolantes, láminas de seguridad)
  ('Herramientas')        -- (Gatas hidráulicas, cables de corriente, kits de emergencia)
ON CONFLICT (nombre) DO NOTHING;
-- Usuarios credenciales para que puedas probar el Login de una
INSERT INTO usuarios (nombre, email, password, rol) VALUES
  ('Admin AUTOSPORT', 'admin@autosport.com', crypt('admin123', gen_salt('bf')), 'admin'),
  ('Bodeguero Principal', 'bodega@autosport.com', crypt('bodega123', gen_salt('bf')), 'bodeguero')
ON CONFLICT (email) DO NOTHING;