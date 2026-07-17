CREATE TABLE IF NOT EXISTS configuraciones (
  clave VARCHAR(50) PRIMARY KEY,
  valor TEXT NOT NULL,
  descripcion TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO configuraciones (clave, valor, descripcion) VALUES
  ('restaurant_name', 'A La Burger', 'Nombre público del Restaurante'),
  ('currency', 'MXN', 'Moneda principal del sistema (ej. MXN, USD)'),
  ('tax_rate', '16', 'Porcentaje de impuesto a aplicar (ej. 16)'),
  ('auto_print', 'false', 'Activar impresión automática de comprobantes')
ON CONFLICT (clave) DO NOTHING;
