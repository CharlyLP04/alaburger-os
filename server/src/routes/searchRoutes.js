const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', searchController.searchAll);

module.exports = router;
