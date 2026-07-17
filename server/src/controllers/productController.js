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
      `SELECT p.id,
       p.nombre,
       p.descripcion,
       p.precio,
       p.disponible,
       p.categoria_id,
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

const obtenerTodosLosProductos = async (req, res) => {
  try {
    const resultado = await pool.query(
      `SELECT p.id, p.nombre, p.descripcion, p.precio, p.disponible,
              p.categoria_id, c.nombre AS categoria
       FROM productos p
       INNER JOIN categorias c ON c.id = p.categoria_id
       ORDER BY c.nombre, p.nombre`
    );

    const productos = resultado.rows.map((p) => ({
      ...p,
      precio: parseFloat(p.precio),
    }));

    return res.status(200).json({ data: productos });
  } catch (error) {
    return manejarErrorInterno(error, res, 'obtener todos los productos');
  }
};

const crearProducto = async (req, res) => {
  const { nombre, descripcion, precio, categoria_id, disponible } = req.body;
  if (!nombre || !precio || !categoria_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, precio, categoria_id)' });
  }
  try {
    const query = `
      INSERT INTO productos (nombre, descripcion, precio, categoria_id, disponible)
      VALUES ($1, $2, $3, $4, $5) RETURNING *
    `;
    const valores = [nombre, descripcion, precio, categoria_id, disponible !== undefined ? disponible : true];
    const resultado = await pool.query(query, valores);
    res.status(201).json({ data: resultado.rows[0] });
  } catch (error) {
    return manejarErrorInterno(error, res, 'crear producto');
  }
};

const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria_id, disponible } = req.body;
  try {
    const query = `
      UPDATE productos
      SET nombre = COALESCE($1, nombre),
          descripcion = COALESCE($2, descripcion),
          precio = COALESCE($3, precio),
          categoria_id = COALESCE($4, categoria_id),
          disponible = COALESCE($5, disponible),
          updated_at = NOW()
      WHERE id = $6 RETURNING *
    `;
    const valores = [nombre, descripcion, precio, categoria_id, disponible, id];
    const resultado = await pool.query(query, valores);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(200).json({ data: resultado.rows[0] });
  } catch (error) {
    return manejarErrorInterno(error, res, 'actualizar producto');
  }
};

const eliminarProducto = async (req, res) => {
  const { id } = req.params;
  try {
    const resultado = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
    if (resultado.rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(200).json({ mensaje: 'Producto eliminado exitosamente' });
  } catch (error) {
    return manejarErrorInterno(error, res, 'eliminar producto');
  }
};

const obtenerCategorias = async (req, res) => {
  try {
    const resultado = await pool.query('SELECT id, nombre FROM categorias WHERE activo = true ORDER BY nombre');
    return res.status(200).json({ data: resultado.rows });
  } catch (error) {
    return manejarErrorInterno(error, res, 'obtener categorias');
  }
};

const obtenerReceta = async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT pi.ingrediente_id, i.nombre, i.unidad, pi.cantidad
      FROM producto_ingredientes pi
      JOIN ingredientes i ON i.id = pi.ingrediente_id
      WHERE pi.producto_id = $1
    `;
    const resultado = await pool.query(query, [id]);
    res.status(200).json({ data: resultado.rows });
  } catch (error) {
    return manejarErrorInterno(error, res, 'obtener receta');
  }
};

const actualizarReceta = async (req, res) => {
  const { id } = req.params; // producto_id
  const { ingredientes } = req.body; // array de { ingrediente_id, cantidad }
  
  if (!Array.isArray(ingredientes)) {
    return res.status(400).json({ error: 'Formato inválido. "ingredientes" debe ser un arreglo' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Eliminar la receta anterior
    await client.query('DELETE FROM producto_ingredientes WHERE producto_id = $1', [id]);
    
    // Insertar los nuevos ingredientes
    if (ingredientes.length > 0) {
      const valores = [];
      const placeholders = ingredientes.map((ing, i) => {
        valores.push(id, ing.ingrediente_id, ing.cantidad);
        const idx = i * 3;
        return `($${idx + 1}, $${idx + 2}, $${idx + 3})`;
      }).join(', ');
      
      await client.query(`
        INSERT INTO producto_ingredientes (producto_id, ingrediente_id, cantidad)
        VALUES ${placeholders}
      `, valores);
    }
    
    await client.query('COMMIT');
    res.status(200).json({ mensaje: 'Receta actualizada exitosamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    return manejarErrorInterno(error, res, 'actualizar receta');
  } finally {
    client.release();
  }
};

module.exports = {
  obtenerProductos,
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerReceta,
  actualizarReceta
};
