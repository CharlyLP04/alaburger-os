const pool = require('../config/db');

const crearPedido = async (req, res) => {
  const client = await pool.connect();

  try {
    const { mesa_id, mesero_id, productos, notas, tipo } = req.body;

    if (!mesero_id || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'mesero_id y productos (array no vacío) son obligatorios.',
      });
    }

    await client.query('BEGIN');

    let total = 0;
    const detalles = [];

    for (const item of productos) {
      const { producto_id, cantidad = 1, notas: notasItem } = item;

      if (!producto_id || cantidad < 1) {
        throw new Error('Cada producto debe incluir producto_id y cantidad válida.');
      }

      const productoResult = await client.query(
        `SELECT id, nombre, precio, disponible
         FROM productos
         WHERE id = $1`,
        [producto_id]
      );

      if (productoResult.rows.length === 0) {
        throw new Error(`Producto con id ${producto_id} no existe.`);
      }

      const producto = productoResult.rows[0];

      if (!producto.disponible) {
        throw new Error(`El producto "${producto.nombre}" no está disponible.`);
      }

      const precioUnitario = parseFloat(producto.precio);
      const subtotal = precioUnitario * cantidad;
      total += subtotal;

      detalles.push({
        producto_id,
        cantidad,
        precio_unitario: precioUnitario,
        subtotal,
        notas: notasItem || null,
      });
    }

    const pedidoResult = await client.query(
      `INSERT INTO pedidos (mesa_id, mesero_id, estado, tipo, notas, total)
       VALUES ($1, $2, 'pendiente', $3, $4, $5)
       RETURNING id, mesa_id, mesero_id, estado, tipo, notas, total, created_at`,
      [mesa_id || null, mesero_id, tipo || 'local', notas || null, total]
    );

    const pedido = pedidoResult.rows[0];
    const detallesInsertados = [];

    for (const detalle of detalles) {
      const detalleResult = await client.query(
        `INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, notas)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, producto_id, cantidad, precio_unitario, subtotal, notas`,
        [pedido.id, detalle.producto_id, detalle.cantidad, detalle.precio_unitario, detalle.notas]
      );

      const fila = detalleResult.rows[0];
      detallesInsertados.push({
        ...fila,
        precio_unitario: parseFloat(fila.precio_unitario),
        subtotal: parseFloat(fila.subtotal),
      });
    }

    await client.query('COMMIT');

    return res.status(201).json({
      mensaje: 'Pedido creado correctamente',
      pedido: {
        ...pedido,
        total: parseFloat(pedido.total),
      },
      detalles: detallesInsertados,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear pedido:', error);

    const esValidacion = error.message.includes('Producto') || error.message.includes('producto');

    return res.status(esValidacion ? 400 : 500).json({
      error: esValidacion ? 'Datos inválidos' : 'Error interno del servidor',
      mensaje: error.message,
    });
  } finally {
    client.release();
  }
};

module.exports = { crearPedido };
