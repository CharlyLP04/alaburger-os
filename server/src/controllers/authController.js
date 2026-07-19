const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); 
const { manejarErrorInterno } = require('../utils/errorHandler');
const { generarAccessToken, generarRefreshToken } = require('../utils/jwt');

/**
 * 🔐 Inicio de sesión
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'Usuario y contraseña son obligatorios.',
      });
    }

    const resultado = await pool.query(
      `SELECT u.id, u.nombre, u.apellido, u.username, u.password_hash, u.activo, r.nombre AS rol
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.username = $1`,
      [username.toLowerCase().trim()]
    );

    if (resultado.rows.length === 0) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Usuario o contraseña incorrectos.',
      });
    }

    const usuario = resultado.rows[0];

    if (!usuario.activo) {
      return res.status(403).json({ error: 'Tu cuenta ha sido desactivada.' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Usuario o contraseña incorrectos.',
      });
    }

    // 🛠️ HU-02: Generación de tokens usando utilidades centralizadas
    const accessToken = generarAccessToken(usuario);
    const refreshToken = generarRefreshToken(usuario);

    // Criterio DoD: Almacenar hash del refreshToken para máxima seguridad
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días

    // Inserta en la tabla (Asegúrate si tu columna es user_id o usuario_id)
    await pool.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) 
       VALUES ($1, $2, $3)`,
      [usuario.id, tokenHash, expiresAt]
    );

    return res.status(200).json({
      token: accessToken,
      refreshToken,
      usuario: {
        id: usuario.id,
        nombre: `${usuario.nombre} ${usuario.apellido}`.trim(),
        username: usuario.username,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    return manejarErrorInterno(error, res, 'login');
  }
};

/**
 * 🔄 🛠️ HU-02: Renovación de Access Token
 * Endpoint: POST /api/auth/refresh
 */
const refreshSession = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token requerido.' });
    }

    let decoded;
    try {
      // Verifica firma matemática y expiración inicial de 7 días
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'secret_key_temporal');
    } catch (err) {
      // Criterio de Aceptación 4: Token inválido/matemáticamente expirado -> Fuerza re-login
      return res.status(401).json({ error: 'Refresh token inválido o expirado. Inicie sesión de nuevo.' });
    }

    // Obtener el hash para buscarlo en la Base de Datos
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const resultadoToken = await pool.query(
      `SELECT * FROM refresh_tokens 
       WHERE token_hash = $1 AND revoked_at IS NULL`,
      [tokenHash]
    );

    const tokenDb = resultadoToken.rows[0];

    // Criterio de Aceptación 4: Si no existe, fue revocado o expiró la fecha en BD
    if (!tokenDb || new Date() > new Date(tokenDb.expires_at)) {
      return res.status(401).json({ error: 'Refresh token inválido o expirado. Inicie sesión de nuevo.' });
    }

    // Obtener datos frescos del usuario para armar el nuevo payload
    const resultadoUsuario = await pool.query(
      `SELECT u.id, r.nombre AS rol 
       FROM usuarios u
       INNER JOIN roles r ON r.id = u.rol_id
       WHERE u.id = $1`,
      [decoded.sub]
    );

    const usuario = resultadoUsuario.rows[0];
    if (!usuario) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    // Criterio de Aceptación 3: Emite un nuevo accessToken sin requerir contraseña
    const nuevoAccessToken = generarAccessToken(usuario);

    return res.status(200).json({
      token: nuevoAccessToken
    });
  } catch (error) {
    return manejarErrorInterno(error, res, 'refreshSession');
  }
};

/**
 * 🚪 Cierre de sesión seguro
 */
const logout = async (req, res) => {
  try {
    const usuarioId = req.user?.id || req.user?.sub; 

    if (!usuarioId) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Revocar TODOS los tokens activos de este usuario en BD
    await pool.query(
      `UPDATE refresh_tokens 
       SET revoked_at = NOW() 
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [usuarioId]
    );

    return res.status(200).json({ mensaje: 'Sesión cerrada exitosamente.' });
  } catch (error) {
    return manejarErrorInterno(error, res, 'logout');
  }
};
// Asegúrate de que las TRES funciones estén aquí dentro:
module.exports = { login, logout, refreshSession };