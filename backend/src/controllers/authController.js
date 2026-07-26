const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const pool   = require('../config/db')

const generarToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

const intentos = {}

exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Credenciales requeridas' })

  const key = email.toLowerCase()
  const ahora = Date.now()

  if (intentos[key]) {
    if (intentos[key].bloqueado && ahora < intentos[key].hasta) {
      const seg = Math.ceil((intentos[key].hasta - ahora) / 1000)
      return res.status(429).json({ error: `Bloqueado. Espera ${seg} segundos.` })
    }
    if (ahora >= intentos[key]?.hasta) delete intentos[key]
  }

  try {
    const { rows } = await pool.query(
      `SELECT * FROM usuarios WHERE (email = $1 OR LOWER(nombre) = LOWER($1)) AND activo = TRUE`,
      [key]
    )
    const usuario = rows[0]
    const valido  = usuario && await bcrypt.compare(password, usuario.password)

    if (!valido) {
      if (!intentos[key]) intentos[key] = { count: 0 }
      intentos[key].count++
      if (intentos[key].count >= 5) {
        intentos[key].bloqueado = true
        intentos[key].hasta = ahora + 5 * 60 * 1000
        return res.status(429).json({ error: 'Demasiados intentos. Bloqueado 5 minutos.' })
      }
      return res.status(401).json({ error: `Credenciales inválidas. Intento ${intentos[key].count}/5` })
    }

    delete intentos[key]
    const token = generarToken(usuario)
    res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.me = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, created_at FROM usuarios WHERE id = $1',
      [req.user.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}