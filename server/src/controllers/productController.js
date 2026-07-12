const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const obtenerProductos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.disponible,
              c.nombre AS categoria
       FROM productos p
       INNER JOIN categorias c ON c.id = p.categoria_id
       WHERE p.disponible = true
       ORDER BY c.nombre, p.nombre`
    );

    const productos = resultado.rows.map((p) => ({
      ...p,
      precio: parseFloat(p.precio),
    }));

    return res.status(200).json({ productos });
  } catch (error) {
    return manejarErrorInterno(error, res, 'obtener productos');
  }
};

module.exports = { obtenerProductos };
