const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const obtenerProductos = async (req, res) => {
  try {
    const { categoria_id, activo, page, limit } = req.query;
    const rol = req.usuario?.rol;

    const pageNum = page !== undefined ? parseInt(page, 10) : 1;
    const limitNum = limit !== undefined ? parseInt(limit, 10) : 20;

    if (Number.isNaN(pageNum) || pageNum < 1) {
      const error = new Error('El parámetro page debe ser un entero mayor o igual a 1.');
      error.status = 400;
      throw error;
    }

    if (Number.isNaN(limitNum) || limitNum < 1) {
      const error = new Error('El parámetro limit debe ser un entero mayor o igual a 1.');
      error.status = 400;
      throw error;
    }

    const condiciones = [];
    const params = [];
    let paramIndex = 1;

    if (categoria_id !== undefined) {
      const categoriaId = parseInt(categoria_id, 10);
      if (Number.isNaN(categoriaId)) {
        const error = new Error('El parámetro categoria_id debe ser un entero válido.');
        error.status = 400;
        throw error;
      }
      condiciones.push(`p.categoria_id = $${paramIndex}`);
      params.push(categoriaId);
      paramIndex += 1;
    }

    if (rol === 'mesero') {
      condiciones.push('p.disponible = true');
    } else if (activo !== undefined) {
      if (activo !== 'true' && activo !== 'false') {
        const error = new Error('El parámetro activo debe ser true o false.');
        error.status = 400;
        throw error;
      }
      condiciones.push(`p.disponible = $${paramIndex}`);
      params.push(activo === 'true');
      paramIndex += 1;
    }

    const whereClause = condiciones.length > 0
      ? `WHERE ${condiciones.join(' AND ')}`
      : '';

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM productos p
       INNER JOIN categorias c ON c.id = p.categoria_id
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total, 10);
    const offset = (pageNum - 1) * limitNum;

    const resultado = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.disponible,
              c.nombre AS categoria
       FROM productos p
       INNER JOIN categorias c ON c.id = p.categoria_id
       ${whereClause}
       ORDER BY c.nombre, p.nombre
       LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, limitNum, offset]
    );

    const data = resultado.rows.map((p) => ({
      ...p,
      precio: parseFloat(p.precio),
    }));

    const totalPages = total === 0 ? 1 : Math.ceil(total / limitNum);

    return res.status(200).json({
      data,
      total,
      page: pageNum,
      totalPages,
    });
  } catch (error) {
    return manejarErrorInterno(error, res, 'obtener productos');
  }
};

module.exports = { obtenerProductos };
