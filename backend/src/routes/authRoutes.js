const router = require('express').Router()
const auth   = require('../middleware/authMiddleware')
const ctrl   = require('../controllers/authController')

router.post('/login', ctrl.login)
router.get('/me', auth, ctrl.me)

// Rutas de recuperación de contraseña
router.post('/forgot-password', ctrl.solicitarRecuperacion)
router.post('/reset-password', ctrl.restablecerPassword)

module.exports = router