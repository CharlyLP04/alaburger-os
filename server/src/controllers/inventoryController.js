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

module.exports = { obtenerInventario };
