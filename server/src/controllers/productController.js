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
  try {
    const {
      nombre,
      descripcion,
      precio,
      categoria_id,
      imagen_url,
      disponible
    } = req.body;

    // Campos obligatorios
    if (!nombre || precio === undefined || !categoria_id) {
      return res.status(400).json({
        error: 'Faltan campos obligatorios (nombre, precio, categoria_id)'
      });
    }

    // Validar precio
    if (isNaN(precio) || Number(precio) <= 0) {
      return res.status(400).json({
        error: 'El precio debe ser mayor a 0.'
      });
    }

    // Validar categoría
console.log("BODY:", req.body);
console.log("categoria_id:", categoria_id);

const categoria = await pool.query(
  'SELECT id FROM categorias WHERE id = $1',
  [categoria_id]
);

console.log("Categoria encontrada:", categoria.rows);

if (!categoria.rows.length) {
  return res.status(400).json({
    error: 'Categoría no válida.'
  });
}

// Insertar producto
const resultado = await pool.query(
  `INSERT INTO productos
  (
    nombre,
    descripcion,
    precio,
    categoria_id,
    imagen_url,
    disponible
  )
  VALUES
  ($1,$2,$3,$4,$5,$6)
  RETURNING *`,
  [
    nombre,
    descripcion || null,
    precio,
    categoria_id,
    imagen_url || null,
    disponible ?? true
  ]
);

return res.status(201).json({
  data: resultado.rows[0]
});

  } catch (error) {
    console.error("ERROR INSERTANDO PRODUCTO:");
    console.error(error);
  
    return manejarErrorInterno(error, res, 'crear producto');
  }
};

const actualizarProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, precio, categoria_id, disponible } = req.body;
  // Validar precio
if (precio !== undefined) {
  if (isNaN(precio) || Number(precio) <= 0) {
    return res.status(400).json({
      error: 'El precio debe ser mayor a 0.'
    });
  }
}

// Validar categoría
if (categoria_id !== undefined) {
  const categoria = await pool.query(
    'SELECT id FROM categorias WHERE id = $1',
    [categoria_id]
  );

  if (categoria.rows.length === 0) {
    return res.status(400).json({
      error: 'Categoría no válida.'
    });
  }
}
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
    const resultado = await pool.query(
      `UPDATE productos
       SET disponible = false
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        error: 'Producto no encontrado'
      });
    }

    return res.status(200).json({
      mensaje: 'Producto desactivado correctamente.'
    });

  } catch (error) {
    return manejarErrorInterno(error, res, 'desactivar producto');
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

const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, icono } = req.body;

    // Validar nombre
    if (!nombre || nombre.trim() === '') {
      return res.status(400).json({
        error: 'El nombre de la categoría es obligatorio.'
      });
    }

    // Verificar si ya existe
    const existe = await pool.query(
      'SELECT id FROM categorias WHERE LOWER(nombre) = LOWER($1)',
      [nombre.trim()]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({
        error: 'Ya existe una categoría con ese nombre.'
      });
    }

    // Insertar categoría
    const resultado = await pool.query(
      `INSERT INTO categorias
      (nombre, descripcion, icono)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [
        nombre.trim(),
        descripcion || null,
        icono || null
      ]
    );

    return res.status(201).json({
      data: resultado.rows[0]
    });

  } catch (error) {
    return manejarErrorInterno(error, res, 'crear categoría');
  }
};

const actualizarCategoria = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, icono, activo } = req.body;

    const existe = await pool.query(
      'SELECT id FROM categorias WHERE id = $1',
      [id]
    );

    if (existe.rows.length === 0) {
      return res.status(404).json({
        error: 'Categoría no encontrada.'
      });
    }

    const resultado = await pool.query(
      `UPDATE categorias
       SET nombre = COALESCE($1, nombre),
           descripcion = COALESCE($2, descripcion),
           icono = COALESCE($3, icono),
           activo = COALESCE($4, activo)
       WHERE id = $5
       RETURNING *`,
      [
        nombre,
        descripcion,
        icono,
        activo,
        id
      ]
    );

    return res.status(200).json({
      data: resultado.rows[0]
    });

  } catch (error) {
    return manejarErrorInterno(error, res, 'actualizar categoría');
  }
};


const eliminarCategoria = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que exista
    const categoria = await pool.query(
      'SELECT id FROM categorias WHERE id = $1',
      [id]
    );

    if (categoria.rows.length === 0) {
      return res.status(404).json({
        error: 'Categoría no encontrada.'
      });
    }

    // Verificar si está siendo utilizada
    const productos = await pool.query(
      'SELECT id FROM productos WHERE categoria_id = $1 LIMIT 1',
      [id]
    );

    if (productos.rows.length > 0) {
      return res.status(400).json({
        error: 'No se puede eliminar la categoría porque tiene productos asociados.'
      });
    }

    await pool.query(
      'DELETE FROM categorias WHERE id = $1',
      [id]
    );

    return res.status(200).json({
      mensaje: 'Categoría eliminada correctamente.'
    });

  } catch (error) {
    return manejarErrorInterno(error, res, 'eliminar categoría');
  }
};

const obtenerReceta = async (req, res) => {
  const { id } = req.params;
  try {
    const producto = await pool.query('SELECT id FROM productos WHERE id = $1', [id]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

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

  const idsVistos = new Set();
  for (const ing of ingredientes) {
    if (idsVistos.has(ing.ingrediente_id)) {
      return res.status(400).json({ error: 'No se permiten ingredientes duplicados.' });
    }
    idsVistos.add(ing.ingrediente_id);
  }

  for (const ing of ingredientes) {
    const cantidad = Number(ing.cantidad);
    if (ing.cantidad == null || Number.isNaN(cantidad) || cantidad <= 0) {
      return res.status(400).json({ error: 'La cantidad debe ser mayor que cero.' });
    }
  }

  try {
    const producto = await pool.query('SELECT id FROM productos WHERE id = $1', [id]);
    if (producto.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado.' });
    }

    if (ingredientes.length > 0) {
      const ingredienteIds = ingredientes.map((ing) => ing.ingrediente_id);
      const existentes = await pool.query(
        'SELECT id FROM ingredientes WHERE id = ANY($1::int[])',
        [ingredienteIds]
      );

      if (existentes.rows.length !== ingredienteIds.length) {
        return res.status(400).json({ error: 'Ingrediente no encontrado.' });
      }
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
  } catch (error) {
    return manejarErrorInterno(error, res, 'actualizar receta');
  }
};

module.exports = {
  obtenerProductos,
  obtenerTodosLosProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  obtenerReceta,
  actualizarReceta
};