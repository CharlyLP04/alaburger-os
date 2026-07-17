const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models'); 

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const usuario = await Usuario.findOne({ where: { email } });

        if (!usuario) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const passwordValido = await bcrypt.compare(password, usuario.password_hash);
        if (!passwordValido) {
            return res.status(401).json({ error: "Credenciales inválidas" });
        }

        const payload = {
            sub: usuario.id,
            rol: usuario.rol
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { 
            algorithm: 'HS256', 
            expiresIn: '8h' 
        });

        return res.status(200).json({
            token,
            user: {
                id: usuario.id,
                nombre: usuario.nombre,
                rol: usuario.rol
            }
        });

    } catch (error) {
        console.error("Error en login:", error.message);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

module.exports = { login };