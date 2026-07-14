module.exports = (...rolesPermitidos) => {
  return (req, res, next) => {
    // 1. Verificamos que exista el usuario en la petición (inyectado por el authMiddleware)
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.' })
    }

    // Nota: Revisa si en tu base de datos y token usas "req.user.rol" o "req.user.role"
    // He puesto ambas opciones para que no falle:
    const userRole = req.user.rol || req.user.role;

    // 2. Comprobamos si el rol del usuario está dentro de los roles permitidos
    if (!rolesPermitidos.includes(userRole)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Se requiere rol de: ${rolesPermitidos.join(' o ')}` 
      })
    }

    next()
  }
}