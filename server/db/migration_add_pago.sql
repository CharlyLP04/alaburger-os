-- Migración: agrega tracking de pago con Stripe a la tabla pedidos
-- Ejecutar solo si la base de datos ya existía antes de este cambio.
-- (Si vas a crear la base de datos desde cero, no hace falta: ya está en schema.sql)

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) NOT NULL DEFAULT 'pendiente'
        CHECK (estado_pago IN ('pendiente', 'pagado', 'fallido'));

ALTER TABLE pedidos
    ADD COLUMN IF NOT EXISTS stripe_payment_intent_id VARCHAR(120);
