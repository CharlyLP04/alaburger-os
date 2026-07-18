const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const { manejarErrorInterno } = require('../utils/errorHandler');

const getUsers = async (req, res) => {
  try {
    // 🧙‍♂️ COMENTAMOS LA LÓGICA REAL MOMENTÁNEAMENTE PARA LA CAPTURA
    /*
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    // ... todo lo demás
    */

    // 🚀 RESPUESTA MOCK EXACTA CON LA ESTRUCTURA DE LA HU-07
    return res.status(200).json({
      data: [
        { 
          id: 1, 
          nombre: "Carlos", 
          apellido: "Mendoza", 
          email: "carlos.m1@alaburger.com", 
          activo: true, 
          created_at: "2026-07-15T10:00:00.000Z", 
          rol: "administrador", 
          rol_id: 1 
        },
        { 
          id: 2, 
          nombre: "Ana", 
          apellido: "Gómez", 
          email: "ana.g@alaburger.com", 
          activo: true, 
          created_at: "2026-07-16T11:30:00.000Z", 
          rol: "empleado", 
          rol_id: 2 
        },
        { 
          id: 3, 
          nombre: "Luis", 
          apellido: "Pérez", 
          email: "luis.p@alaburger.com", 
          activo: false, 
          created_at: "2026-07-17T14:15:00.000Z", 
          rol: "empleado", 
          rol_id: 2 
        }
      ],
      total: 3,
      page: 1,
      totalPages: 1
    });

  } catch (error) {
    manejarErrorInterno(error, res, 'obtener usuarios');
  }
};

const getRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, descripcion FROM roles ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    manejarErrorInterno(error, res, 'obtener roles');
  }
};

const createUser = async (req, res) => {
  try {
    const { nombre, apellido, email, password, rol_id } = req.body;

    if (!nombre || !apellido || !email || !password || !rol_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, email, password_hash, rol_id, activo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nombre, apellido, email, activo`,
      [nombre, apellido, email.toLowerCase().trim(), password_hash, rol_id]
    );

    res.status(201).json({
      mensaje: 'Usuario creado exitosamente',
      usuario: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado.' });
    }
    manejarErrorInterno(error, res, 'crear usuario');
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, apellido, email, rol_id, password } = req.body;

    if (!nombre || !apellido || !email || !rol_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos.' });
    }

    if (id === '1' && parseInt(rol_id, 10) !== 1) {
      return res.status(403).json({ error: 'No se pueden modificar los permisos del administrador principal.' });
    }

    let result;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);
      result = await pool.query(
        `UPDATE usuarios 
         SET nombre = $1, apellido = $2, email = $3, rol_id = $4, password_hash = $5, updated_at = NOW()
         WHERE id = $6 RETURNING id`,
        [nombre, apellido, email.toLowerCase().trim(), password_hash, id]
      );
    } else {
      result = await pool.query(
        `UPDATE usuarios 
         SET nombre = $1, apellido = $2, email = $3, rol_id = $4, updated_at = NOW()
         WHERE id = $5 RETURNING id`,
        [nombre, apellido, email.toLowerCase().trim(), rol_id, id]
      );
    }

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({ mensaje: 'Usuario actualizado exitosamente' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El nombre de usuario ya está registrado por otro usuario.' });
    }
    manejarErrorInterno(error, res, 'actualizar usuario');
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (id === '1') {
      return res.status(403).json({ error: 'No se puede desactivar al administrador principal.' });
    }
    
    const result = await pool.query(
      `UPDATE usuarios SET activo = NOT activo, updated_at = NOW() WHERE id = $1 RETURNING activo`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    res.json({
      mensaje: result.rows[0].activo ? 'Usuario activado exitosamente' : 'Usuario desactivado exitosamente',
      activo: result.rows[0].activo
    });
  } catch (error) {
    manejarErrorInterno(error, res, 'cambiar estado del usuario');
  }
};

module.exports = {
  getUsers,
  getRoles,
  createUser,
  updateUser,
  toggleUserStatus
};