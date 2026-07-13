const router = require('express').Router()
const auth   = require('../middleware/authMiddleware')
const ctrl   = require('../controllers/movimientosController')

router.get('/',                  auth, ctrl.listar)
router.get('/accesorio/:id',      auth, ctrl.porAccesorio)
router.post('/',                 auth, ctrl.registrar)
router.get('/reporte', auth, ctrl.reporte)
router.get('/dashboard-diario', auth, ctrl.dashboardDiario)
module.exports = router