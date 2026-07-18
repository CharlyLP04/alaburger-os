const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Dejamos solo las rutas limpias
router.get('/', userController.getUsers);
router.get('/roles', userController.getRoles);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.toggleUserStatus);

module.exports = router;