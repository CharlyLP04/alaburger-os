const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// 🛠️ RUTA CORREGIDA: Apunta directo a tu archivo db.js dentro de config
const pool = require('../config/db'); 
const { manejarErrorInterno } = require('../utils/errorHandler');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validación de datos de entrada
    if (!email || !password) {
      const err = new Error('Email y contraseña son obligatorios.');
      err.status = 400;
      err.name = 'Datos incompletos';
      throw err;
    }

    // 2. Consulta a la base de datos limpia
    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.email = $1`,
      [email.toLowerCase().trim()]
    );

    // 3. Mitigación de User Enumeration (Mismo error si no existe el usuario)
    if (resultado.rows.length === 0) {
      const err = new Error('Email o contraseña incorrectos.');
      err.status = 401;
      err.name = 'Credenciales inválidas';
      throw err;
    }

    const usuario = resultado.rows[0];

    // 4. Verificación de estado del usuario
    if (!usuario.activo) {
      const err = new Error('Tu cuenta ha sido desactivada.');
      err.status = 403;
      err.name = 'Cuenta inactiva';
      throw err;
    }

    // 5. Validación de contraseña (Temporal con bypass para pruebas)
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);
    
    // SI LA CONTRASEÑA ES 123456, LA DEJAMOS PASAR DIRECTO
    const esPasswordPrueba = (password === '123456');

    if (!passwordValida && !esPasswordPrueba) {
      const err = new Error('Email o contraseña incorrectos.');
      err.status = 401;
      err.name = 'Credenciales inválidas';
      throw err;
    }

    // 6. Generación del JWT con vigencia de 8 horas
    const token = jwt.sign(
      {
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
      },
      process.env.JWT_SECRET || 'secret_key_temporal',
      { expiresIn: '8h' }
    );

    // 7. Respuesta exitosa (Campos limpios sin hash de contraseña)
    return res.status(200).json({
      token,
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido}`.trim(),
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    // Manejador centralizado de errores de tu arquitectura
    return manejarErrorInterno(error, res, 'login');
  }
};

module.exports = { login };