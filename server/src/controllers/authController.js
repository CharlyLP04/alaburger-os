const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Email y contraseña son obligatorios.',
      });
    }

    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Email o contraseña incorrectos.',
      });
    }

    const usuario = resultado.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({
        error: 'Cuenta inactiva',
        mensaje: 'Tu cuenta ha sido desactivada.',
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Email o contraseña incorrectos.',
      });
    }

    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido}`,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return manejarErrorInterno(error, res, 'login');
  }
};

module.exports = { login };
