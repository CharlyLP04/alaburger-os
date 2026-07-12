-- ============================================================
-- DATOS SEMILLA ADICIONALES (HU-41)
-- Agrega 10 ingredientes más para probar con un total de 18+ ingredientes.
-- ============================================================

INSERT INTO ingredientes (nombre, unidad) VALUES
    ('Tocino crujiente',    'piezas'),
    ('Mayonesa chipotle',   'litros'),
    ('Salsa BBQ',           'litros'),
    ('Pechuga de pollo',    'piezas'),
    ('Chile jalapeño',      'kg'),
    ('Champiñones',         'kg'),
    ('Queso suizo',         'piezas'),
    ('Piña en rodajas',     'piezas'),
    ('Mostaza',             'litros'),
    ('Catsup',              'litros')
ON CONFLICT (nombre) DO NOTHING;

-- Relacionar con inventario inicial
INSERT INTO inventario (ingrediente_id, cantidad_disponible, stock_minimo) VALUES
    ((SELECT id FROM ingredientes WHERE nombre = 'Tocino crujiente'),  120,   30),
    ((SELECT id FROM ingredientes WHERE nombre = 'Mayonesa chipotle'), 1.5,   0.5),
    ((SELECT id FROM ingredientes WHERE nombre = 'Salsa BBQ'),           0.4,   0.5), -- stock bajo
    ((SELECT id FROM ingredientes WHERE nombre = 'Pechuga de pollo'),    45,    10),
    ((SELECT id FROM ingredientes WHERE nombre = 'Chile jalapeño'),      0.3,   0.5), -- stock bajo
    ((SELECT id FROM ingredientes WHERE nombre = 'Champiñones'),         1.2,   0.5),
    ((SELECT id FROM ingredientes WHERE nombre = 'Queso suizo'),         50,    15),
    ((SELECT id FROM ingredientes WHERE nombre = 'Piña en rodajas'),     8,     10), -- stock bajo
    ((SELECT id FROM ingredientes WHERE nombre = 'Mostaza'),             0.8,   0.2),
    ((SELECT id FROM ingredientes WHERE nombre = 'Catsup'),              2.5,   0.5)
ON CONFLICT (ingrediente_id) DO NOTHING;
