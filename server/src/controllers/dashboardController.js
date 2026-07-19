const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const getMetrics = async (req, res) => {
  try {
    // Definir el rango del día actual (00:00:00 a 23:59:59 local)
    // Para simplificar y funcionar globalmente con Postgres sin problemas de timezone complejo, 
    // usamos CURRENT_DATE que devuelve la fecha actual del servidor.
    
    // 1. Ventas del Día
    const ventasResult = await pool.query(`
      SELECT SUM(total) as total_ventas 
      FROM pedidos 
      WHERE created_at >= CURRENT_DATE 
      AND estado != 'cancelado'
    `);
    const ventas = parseFloat(ventasResult.rows[0].total_ventas || 0);

    // 2. Pedidos Activos
    const activosResult = await pool.query(`
      SELECT COUNT(*) as activos 
      FROM pedidos 
      WHERE estado IN ('nuevo', 'pendiente', 'preparando')
    `);
    const pedidosActivos = parseInt(activosResult.rows[0].activos || 0, 10);

    // 3. Ticket Promedio (del día)
    const ticketResult = await pool.query(`
      SELECT AVG(total) as promedio 
      FROM pedidos 
      WHERE created_at >= CURRENT_DATE 
      AND estado != 'cancelado'
    `);
    const ticketPromedio = parseFloat(ticketResult.rows[0].promedio || 0);

    // 4. Ventas del Día Anterior (para % de crecimiento)
    const ventasAyerResult = await pool.query(`
      SELECT SUM(total) as total_ventas_ayer 
      FROM pedidos 
      WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' 
      AND created_at < CURRENT_DATE
      AND estado != 'cancelado'
    `);
    const ventasAyer = parseFloat(ventasAyerResult.rows[0].total_ventas_ayer || 0);
    
    let crecimientoVentas = 0;
    if (ventasAyer > 0) {
      crecimientoVentas = ((ventas - ventasAyer) / ventasAyer) * 100;
    } else if (ventas > 0) {
      crecimientoVentas = 100;
    }

    // 5. Últimos 5 Pedidos Recientes
    const ultimosResult = await pool.query(`
      SELECT p.id, p.total, p.estado, p.created_at, u.nombre as mesero
      FROM pedidos p
      LEFT JOIN usuarios u ON p.mesero_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 5
    `);

    res.json({
      ventasDelDia: ventas,
      crecimientoVentas: crecimientoVentas,
      ventasAyer: ventasAyer,
      pedidosActivos,
      ticketPromedio,
      ultimosPedidos: ultimosResult.rows.map(p => ({
        ...p,
        total: parseFloat(p.total)
      }))
    });

  } catch (error) {
    manejarErrorInterno(error, res, 'obtener métricas del dashboard');
  }
};

module.exports = {
  getMetrics
};
