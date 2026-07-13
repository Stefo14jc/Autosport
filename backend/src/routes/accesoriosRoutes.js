const router = require('express').Router()
const auth = require('../middleware/authMiddleware')
const role = require('../middleware/roleMiddleware')
const ctrl = require('../controllers/accesoriosController')

router.get('/filtrar', auth, ctrl.filtrar)
router.get('/stats', auth, ctrl.stats)
router.get('/', auth, ctrl.listar)
router.get('/:id', auth, ctrl.obtener)
router.post('/', auth, role('admin'), ctrl.crear)
router.put('/:id', auth, role('admin'), ctrl.actualizar)
router.delete('/:id', auth, role('admin'), ctrl.eliminar)
router.get('/scan/:id', ctrl.scanPublico)

module.exports = router