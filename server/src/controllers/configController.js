const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const getConfiguraciones = async (req, res) => {
  try {
    const result = await pool.query('SELECT clave, valor, descripcion FROM configuraciones ORDER BY clave ASC');
    // Format into a key-value object for easier frontend consumption
    const configObj = {};
    result.rows.forEach(row => {
      configObj[row.clave] = {
        valor: row.valor,
        descripcion: row.descripcion
      };
    });
    res.json(configObj);
  } catch (error) {
    manejarErrorInterno(res, error, 'obtener configuraciones');
  }
};

const updateConfiguraciones = async (req, res) => {
  try {
    const updates = req.body; // Expecting { restaurant_name: "My Burger", tax_rate: "16" }
    
    // We update each key sequentially inside a transaction
    await pool.query('BEGIN');
    
    for (const [clave, valor] of Object.entries(updates)) {
      await pool.query(
        `UPDATE configuraciones SET valor = $1, updated_at = NOW() WHERE clave = $2`,
        [valor.toString(), clave]
      );
    }
    
    await pool.query('COMMIT');
    
    res.json({ mensaje: 'Configuración actualizada exitosamente' });
  } catch (error) {
    await pool.query('ROLLBACK');
    manejarErrorInterno(res, error, 'actualizar configuraciones');
  }
};

module.exports = {
  getConfiguraciones,
  updateConfiguraciones
};
