/**
 * Centralized error handler to prevent internal info leakage (ACT-10).
 * Distinguishes infrastructure errors (having error.code, e.g. database errors)
 * from business/validation errors (no error.code).
 */
const manejarErrorInterno = (error, res, contexto) => {
  if (error.code) {
    // Error de infraestructura (base de datos, etc.)
    console.error(`[ERROR INFRAESTRUCTURA] en "${contexto}":`, error);
    return res.status(500).json({
      error: 'Error interno del servidor',
      mensaje: 'Ocurrió un error inesperado al procesar la solicitud.',
    });
  }

  // Error de negocio/validación
  console.warn(`[ERROR NEGOCIO] en "${contexto}":`, error.message);
  return res.status(error.status || 400).json({
    error: error.name || 'Error',
    mensaje: error.message,
  });
};

module.exports = { manejarErrorInterno };
