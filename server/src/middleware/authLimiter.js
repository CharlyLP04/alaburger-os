const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // Máximo 5 intentos por IP
    handler: (req, res) => {
        return res.status(429).json({ 
            error: "Demasiados intentos fallidos. Por favor, inténtalo de nuevo en 15 minutos." 
        });
    },
    skipSuccessfulRequests: true 
});

module.exports = loginLimiter;