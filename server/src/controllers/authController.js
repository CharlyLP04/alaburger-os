const bcrypt = require('bcrypt'); // o bcryptjs, según lo que use el archivo
const jwt = require('jsonwebtoken');
// Dejamos un solo punto tal como lo tienen tus compañeros
const pool = require('../config/db');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email y contraseña son obligatorios.');
      err.status = 400;
      err.name = 'Datos incompletos';
      throw err;
    }

    // Buscamos el usuario por su email
    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    if (resultado.rows.length === 0) {
      const err = new Error('Email o contraseña incorrectos.');
      err.status = 401;
      err.name = 'Credenciales inválidas';
      throw err;
    }

    const usuario = resultado.rows[0];

    if (!usuario.activo) {
      const err = new Error('Tu cuenta ha sido desactivada.');
      err.status = 403;
      err.name = 'Cuenta inactiva';
      throw err;
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      const err = new Error('Email o contraseña incorrectos.');
      err.status = 401;
      err.name = 'Credenciales inválidas';
      throw err;
    }

    // ─── Generación de Token JWT ─────────────────────────────────────────────
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, rol: usuario.rol },
      process.env.JWT_SECRET || 'secretkey_fallback',
      { expiresIn: '24h' }
    );

    // Responder al cliente con éxito
    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en el login Controller:', error);
    return res.status(error.status || 500).json({
      error: error.name || 'Error en el servidor',
      mensaje: error.message || 'Ocurrió un error inesperado al iniciar sesión.'
    });
  }
};

module.exports = { login };