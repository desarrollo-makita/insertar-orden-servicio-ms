const express = require('express');
const router = express.Router();
const { insertarOrden } = require('../controllers/insertarOrdenControllers');

router.post('/insertar-orden', insertarOrden);

module.exports = router;
