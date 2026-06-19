// Middleware de autenticación JWT para A La Burger OS
const jwt = require('jsonwebtoken');

/**
 * verificarToken — protege rutas que requieren sesión iniciada.
 * Extrae el token del header Authorization: Bearer <token>
 * y lo valida con la clave secreta JWT_SECRET del entorno.
 */
const verificarToken = (req, res, next) => {
  // Obtener el header de autorización
  const encabezadoAutorizacion = req.headers['authorization'];

  // Verificar que el header exista
  if (!encabezadoAutorizacion) {
    return res.status(401).json({
      error: 'Acceso denegado',
      mensaje: 'No se proporcionó un token de autenticación.',
    });
  }

  // El formato esperado es: "Bearer <token>"
  const partes = encabezadoAutorizacion.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({
      error: 'Token inválido',
      mensaje: 'El formato del token debe ser: Bearer <token>',
    });
  }

  const token = partes[1];

  try {
    // Verificar y decodificar el token
    const cargaUtil = jwt.verify(token, process.env.JWT_SECRET);

    // Adjuntar los datos del usuario al objeto de solicitud
    req.usuario = cargaUtil;

    // Continuar con el siguiente middleware o controlador
    next();
  } catch (error) {
    // Manejar errores comunes de JWT
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expirado',
        mensaje: 'La sesión ha expirado. Por favor, inicia sesión nuevamente.',
      });
    }

    return res.status(403).json({
      error: 'Token inválido',
      mensaje: 'El token proporcionado no es válido.',
    });
  }
};

module.exports = { verificarToken };
