const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Criterio de Aceptación: exp a 8 horas desde iat
function generarAccessToken(usuario) {
  return jwt.sign(
    { sub: usuario.id, rol: usuario.rol },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

// Refresh token de larga duración (7 días)
function generarRefreshToken(usuario) {
  return jwt.sign(
    { sub: usuario.id },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

module.exports = {
  generarAccessToken,
  generarRefreshToken
};