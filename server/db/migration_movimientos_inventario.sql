-- Migración: crea la tabla movimientos_inventario para tracking de entradas, salidas, mermas y ajustes.
CREATE TABLE IF NOT EXISTS movimientos_inventario (
    id              SERIAL          PRIMARY KEY,
    ingrediente_id  INTEGER         NOT NULL REFERENCES ingredientes(id) ON DELETE CASCADE,
    tipo            VARCHAR(20)     NOT NULL CHECK (tipo IN ('entrada', 'salida', 'merma', 'ajuste')),
    cantidad        NUMERIC(12, 3)  NOT NULL CHECK (cantidad > 0),
    motivo          TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);
