const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const role = require('../middleware/roleMiddleware')
const ctrl = require('../controllers/catalogosController')

// Categorías
router.get('/categorias', auth, ctrl.listarCategorias)
router.post('/categorias', auth, role('admin'), ctrl.crearCategoria)
router.put('/categorias/:id', auth, role('admin'), ctrl.actualizarCategoria)
router.delete('/categorias/:id', auth, role('admin'), ctrl.eliminarCategoria)

// Ubicaciones
router.get('/ubicaciones', auth, ctrl.listarUbicaciones)
router.post('/ubicaciones', auth, role('admin'), ctrl.crearUbicacion)
router.put('/ubicaciones/:id', auth, role('admin'), ctrl.actualizarUbicacion)
router.delete('/ubicaciones/:id', auth, role('admin'), ctrl.eliminarUbicacion)

module.exports = router