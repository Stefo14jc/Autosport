const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const role = require('../middleware/roleMiddleware')
const ctrl = require('../controllers/accesoriosController')

// Rutas Públicas (Sin auth)
router.get('/scan/:id', ctrl.scanPublico)
router.get('/public-count', ctrl.conteoPublico)

// Rutas Protegidas (Requieren token)
router.get('/filtrar', auth, ctrl.filtrar)
router.get('/stats', auth, ctrl.stats)
router.get('/', auth, ctrl.listar)
router.get('/:id', auth, ctrl.obtener)
router.post('/', auth, role('admin'), ctrl.crear)
router.put('/:id', auth, role('admin'), ctrl.actualizar)
router.delete('/:id', auth, role('admin'), ctrl.eliminar)

module.exports = router