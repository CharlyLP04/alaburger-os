const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// All user routes require authentication and admin privileges
router.use(verifyToken, isAdmin);

router.get('/', userController.getUsers);
router.get('/roles', userController.getRoles);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.patch('/:id/status', userController.toggleUserStatus);

module.exports = router;
