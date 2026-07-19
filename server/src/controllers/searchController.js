const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
      return res.json([]);
    }

    const searchQuery = `%${q.trim()}%`;
    const searchNumber = parseInt(q.trim(), 10);
    const isNumber = !isNaN(searchNumber);

    // Queries concurrentes
    const [productosRes, usuariosRes, inventarioRes] = await Promise.all([
      // Productos
      pool.query(
        `SELECT p.id, p.nombre, c.nombre as categoria 
         FROM productos p 
         LEFT JOIN categorias c ON p.categoria_id = c.id 
         WHERE p.nombre ILIKE $1 AND p.disponible = true 
         LIMIT 5`,
        [searchQuery]
      ),
      // Usuarios
      pool.query(
        `SELECT u.id, u.nombre, u.apellido, u.username as username, r.nombre as rol 
         FROM usuarios u 
         JOIN roles r ON u.rol_id = r.id 
         WHERE (u.nombre ILIKE $1 OR u.apellido ILIKE $1 OR u.username ILIKE $1) AND u.activo = true 
         LIMIT 5`,
        [searchQuery]
      ),
      // Inventario
      pool.query(
        `SELECT id, nombre, unidad as unidad_medida 
         FROM ingredientes 
         WHERE nombre ILIKE $1 
         LIMIT 5`,
        [searchQuery]
      )
    ]);

    // Unificar resultados
    const results = [];

    productosRes.rows.forEach(p => {
      results.push({
        id: p.id,
        type: 'producto',
        title: p.nombre,
        subtitle: `Categoría: ${p.categoria || 'Sin categoría'}`
      });
    });

    usuariosRes.rows.forEach(u => {
      results.push({
        id: u.id,
        type: 'usuario',
        title: `${u.nombre} ${u.apellido}`,
        subtitle: `@${u.username} • ${u.rol}`
      });
    });

    inventarioRes.rows.forEach(i => {
      results.push({
        id: i.id,
        type: 'inventario',
        title: i.nombre,
        subtitle: `Unidad: ${i.unidad_medida}`
      });
    });

    res.json(results);
  } catch (error) {
    manejarErrorInterno(error, res, 'realizar búsqueda global');
  }
};

module.exports = {
  searchAll
};
