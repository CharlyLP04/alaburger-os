const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models'); 

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('Email y contraseña son obligatorios.');
      err.status = 400;
      err.name = 'Datos incompletos';
      throw err;
    }

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
};

module.exports = { login };