const pool = require('../config/db');

const obtenerInventario = async (req, res) => {
  try {
    const { stock_bajo } = req.query;

    let queryText = `
      SELECT i.id, ing.nombre, i.cantidad_disponible AS cantidad_actual,
             ing.unidad, i.stock_minimo, i.updated_at AS ultima_actualizacion
      FROM inventario i
      INNER JOIN ingredientes ing ON ing.id = i.ingrediente_id
    `;

    const queryParams = [];

    if (stock_bajo === 'true') {
      queryText += ' WHERE i.cantidad_disponible <= i.stock_minimo';
    }

    queryText += ' ORDER BY ing.nombre ASC';

    const resultado = await pool.query(queryText, queryParams);

    const data = resultado.rows.map((row) => ({
      id: row.id,
      nombre: row.nombre,
      cantidad_actual: Number(row.cantidad_actual),
      unidad: row.unidad,
      stock_minimo: Number(row.stock_minimo),
      ultima_actualizacion: row.ultima_actualizacion,
    }));

    return res.status(200).json({ data, total: data.length });
  } catch (error) {
    console.error('Error al obtener el inventario:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: error.message,
    });
  }
};

const crearIngrediente = async (req, res) => {
  const client = await pool.connect();
  try {
    const { nombre, cantidad_actual, unidad, stock_minimo } = req.body;

    // 1. Validaciones de presencia y tipo
    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'El nombre es obligatorio y debe ser un texto válido.',
      });
    }

    const cantidadActualNum = Number(cantidad_actual);
    if (isNaN(cantidadActualNum) || cantidadActualNum < 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'La cantidad actual es obligatoria y debe ser un número no menor a 0.',
      });
    }

    const stockMinimoNum = Number(stock_minimo);
    if (isNaN(stockMinimoNum) || stockMinimoNum < 0) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: 'El stock mínimo es obligatorio y debe ser un número no menor a 0.',
      });
    }

    const unidadesValidas = ['kg', 'g', 'l', 'ml', 'pza'];
    if (!unidad || typeof unidad !== 'string' || !unidadesValidas.includes(unidad.toLowerCase())) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: `La unidad es obligatoria y debe ser una de las siguientes: ${unidadesValidas.join(', ')}.`,
      });
    }

    // 2. Verificar duplicados (insensible a mayúsculas/minúsculas)
    const ingredienteExistente = await pool.query(
      'SELECT id FROM ingredientes WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );

    if (ingredienteExistente.rows.length > 0) {
      return res.status(409).json({
        error: 'El ingrediente ya existe',
        mensaje: 'Ya existe un ingrediente registrado con ese nombre.',
      });
    }

    // 3. Ejecutar transacción
    await client.query('BEGIN');

    // Insertar en ingredientes
    const resIngrediente = await client.query(
      `INSERT INTO ingredientes (nombre, unidad)
       VALUES ($1, $2)
       RETURNING id, nombre, unidad`,
      [nombre.trim(), unidad.toLowerCase()]
    );

    const nuevoIngrediente = resIngrediente.rows[0];

    // Insertar en inventario
    const resInventario = await client.query(
      `INSERT INTO inventario (ingrediente_id, cantidad_disponible, stock_minimo)
       VALUES ($1, $2, $3)
       RETURNING cantidad_disponible, stock_minimo`,
      [nuevoIngrediente.id, cantidadActualNum, stockMinimoNum]
    );

    const nuevoInventario = resInventario.rows[0];

    await client.query('COMMIT');

    // 4. Formatear y enviar respuesta
    const stockBajo = cantidadActualNum <= stockMinimoNum;

    return res.status(201).json({
      id: nuevoIngrediente.id,
      nombre: nuevoIngrediente.nombre,
      cantidad_actual: Number(nuevoInventario.cantidad_disponible),
      unidad: nuevoIngrediente.unidad,
      stock_minimo: Number(nuevoInventario.stock_minimo),
      stock_bajo: stockBajo,
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear el ingrediente:', error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = { obtenerInventario, crearIngrediente };
