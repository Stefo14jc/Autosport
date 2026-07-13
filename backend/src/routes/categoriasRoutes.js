const router = require('express').Router()
const auth   = require('../middleware/authMiddleware')
const ctrl   = require('../controllers/categoriasController')

router.get('/', auth, ctrl.listar)

module.exports = router