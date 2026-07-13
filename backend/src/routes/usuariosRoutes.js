const router = require('express').Router()
const auth   = require('../middleware/authMiddleware')
const role   = require('../middleware/roleMiddleware')
const ctrl   = require('../controllers/usuariosController')

router.get('/',     auth, role('admin'), ctrl.listar)
router.post('/',    auth, role('admin'), ctrl.crear)
router.put('/:id',  auth, role('admin'), ctrl.actualizar)
router.delete('/:id', auth, role('admin'), ctrl.eliminar)

module.exports = router