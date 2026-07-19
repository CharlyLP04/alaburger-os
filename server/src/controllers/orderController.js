const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

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

      // --- DESCUENTO AUTOMÁTICO DE INVENTARIO (HU-45) ---
      const recetasResult = await client.query(
        `SELECT pi.ingrediente_id, pi.cantidad AS cantidad_requerida, ing.nombre AS ingrediente_nombre
         FROM producto_ingredientes pi
         INNER JOIN ingredientes ing ON ing.id = pi.ingrediente_id
         WHERE pi.producto_id = $1`,
        [detalle.producto_id]
      );

      if (recetasResult.rows.length === 0) {
        console.warn(`Producto ${detalle.producto_id} sin receta asignada`);
        continue;
      }

      for (const rec of recetasResult.rows) {
        const cantidadADescontar = Number(rec.cantidad_requerida) * detalle.cantidad;

        // Obtener stock actual bloqueándolo para concurrencia
        const invResult = await client.query(
          `SELECT cantidad_disponible, stock_minimo
           FROM inventario
           WHERE ingrediente_id = $1
           FOR UPDATE`,
          [rec.ingrediente_id]
        );

        if (invResult.rows.length === 0) {
          const errorInv = new Error(`El ingrediente "${rec.ingrediente_nombre}" no está registrado en el inventario.`);
          errorInv.type = 'STOCK_INSUFICIENTE';
          errorInv.ingrediente_id = rec.ingrediente_id;
          errorInv.faltante = cantidadADescontar;
          throw errorInv;
        }

        const cantidadDisponible = Number(invResult.rows[0].cantidad_disponible);

        if (cantidadDisponible < cantidadADescontar) {
          const errorStock = new Error(`Stock insuficiente de "${rec.ingrediente_nombre}". Requerido: ${cantidadADescontar}, Disponible: ${cantidadDisponible}`);
          errorStock.type = 'STOCK_INSUFICIENTE';
          errorStock.ingrediente_id = rec.ingrediente_id;
          errorStock.faltante = cantidadADescontar - cantidadDisponible;
          throw errorStock;
        }

        // Descontar de inventario
        await client.query(
          `UPDATE inventario
           SET cantidad_disponible = cantidad_disponible - $1,
               updated_at = NOW()
           WHERE ingrediente_id = $2`,
          [cantidadADescontar, rec.ingrediente_id]
        );

        // Registrar movimiento
        await client.query(
          `INSERT INTO movimientos_inventario (ingrediente_id, tipo, cantidad, referencia, usuario_id, fecha)
           VALUES ($1, 'salida', $2, $3, $4, NOW())`,
          [
            rec.ingrediente_id,
            cantidadADescontar,
            `pedido #${pedido.id}`,
            req.usuario?.sub || null
          ]
        );
      }
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

    if (error.type === 'STOCK_INSUFICIENTE') {
      return res.status(409).json({
        error: 'Stock insuficiente',
        mensaje: error.message,
        ingrediente_id: error.ingrediente_id,
        faltante: error.faltante,
      });
    }

    const esValidacion = error.message.includes('Producto') || error.message.includes('producto');

    if (esValidacion) {
      return res.status(400).json({
        error: 'Datos inválidos',
        mensaje: error.message,
      });
    }

    return manejarErrorInterno(error, res, 'crear pedido');
  } finally {
    client.release();
  }
};

const obtenerPedidos = async (req, res) => {
  try {
    const pedidosResult = await pool.query(
      `SELECT p.id, p.mesa_id, p.mesero_id, p.estado, p.tipo, p.notas, p.total, p.created_at, 
              u.nombre AS mesero_nombre, u.apellido AS mesero_apellido, m.numero AS mesa_numero
       FROM pedidos p
       LEFT JOIN usuarios u ON p.mesero_id = u.id
       LEFT JOIN mesas m ON p.mesa_id = m.id
       ORDER BY p.created_at DESC`
    );

    const pedidos = pedidosResult.rows.map(p => ({
      ...p,
      total: parseFloat(p.total)
    }));

    if (pedidos.length === 0) {
      return res.json([]);
    }

    const pedidoIds = pedidos.map(p => p.id);
    const detallesResult = await pool.query(
      `SELECT dp.pedido_id, dp.producto_id, dp.cantidad, dp.precio_unitario, dp.notas, pr.nombre AS producto_nombre
       FROM detalle_pedido dp
       INNER JOIN productos pr ON dp.producto_id = pr.id
       WHERE dp.pedido_id = ANY($1)`,
      [pedidoIds]
    );

    const detallesMap = {};
    detallesResult.rows.forEach(d => {
      if (!detallesMap[d.pedido_id]) {
        detallesMap[d.pedido_id] = [];
      }
      detallesMap[d.pedido_id].push({
        ...d,
        precio_unitario: parseFloat(d.precio_unitario)
      });
    });

    const pedidosConDetalles = pedidos.map(p => ({
      ...p,
      items: detallesMap[p.id] || []
    }));

    res.json(pedidosConDetalles);
  } catch (error) {
    manejarErrorInterno(error, res, 'obtener pedidos');
  }
};

const actualizarEstadoPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    if (!estado) {
      return res.status(400).json({ error: 'El estado es requerido.' });
    }

    const result = await pool.query(
      `UPDATE pedidos SET estado = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [estado, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado.' });
    }

    res.json({
      mensaje: 'Estado del pedido actualizado exitosamente',
      pedido: result.rows[0]
    });
  } catch (error) {
    manejarErrorInterno(error, res, 'actualizar estado del pedido');
  }
};

module.exports = { crearPedido, obtenerPedidos, actualizarEstadoPedido };
