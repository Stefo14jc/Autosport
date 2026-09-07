const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const sgMail = require('@sendgrid/mail')
const pool = require('../config/db')

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const generarToken = (usuario) =>
  jwt.sign(
    { id: usuario.id, email: usuario.email, rol: usuario.rol, nombre: usuario.nombre },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  )

const intentos = {}

// INICIAR SESIÓN (Acepta Username o Email)
exports.login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Credenciales requeridas' })

  const key = String(email).trim().toLowerCase()
  const passLimpia = String(password).trim()
  const ahora = Date.now()

  if (intentos[key]) {
    if (intentos[key].bloqueado && ahora < intentos[key].hasta) {
      const seg = Math.ceil((intentos[key].hasta - ahora) / 1000)
      return res.status(429).json({ error: `Bloqueado. Espera ${seg} segundos.` })
    }
    if (ahora >= intentos[key]?.hasta) delete intentos[key]
  }

  try {
    // Busca coincidencia exacta en email O en nombre de usuario
    const { rows } = await pool.query(
      `SELECT * FROM usuarios 
       WHERE (LOWER(TRIM(email)) = $1 OR LOWER(TRIM(nombre)) = $1) 
         AND activo = TRUE 
       LIMIT 1`,
      [key]
    )

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const usuario = rows[0]
    const valido = await bcrypt.compare(passLimpia, usuario.password)

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
    console.error('[LOGIN ERROR]', err)
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

// SOLICITAR RECUPERACIÓN (Acepta Username o Email)
exports.solicitarRecuperacion = async (req, res) => {
  const { email } = req.body
  if (!email) return res.status(400).json({ error: 'Ingresa tu usuario o correo electrónico' })

  const key = String(email).trim().toLowerCase()

  try {
    // Permite buscar por email o por nombre de usuario para enviar el correo registrado
    const { rows } = await pool.query(
      `SELECT * FROM usuarios 
       WHERE (LOWER(TRIM(email)) = $1 OR LOWER(TRIM(nombre)) = $1) 
         AND activo = TRUE 
       LIMIT 1`,
      [key]
    )
    const usuario = rows[0]

    if (!usuario) {
      return res.json({ message: 'Si el usuario existe en el sistema, recibirá un enlace de recuperación.' })
    }

    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetExpires = new Date(Date.now() + 3600000)

    await pool.query(
      'UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, usuario.id]
    )

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`

    const msg = {
      to: usuario.email,
      from: process.env.EMAIL_FROM,
      subject: 'AUTOSPORT — Restablecer contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #0a0a0a; color: #f5f5f5; padding: 20px; border-radius: 8px;">
          <h2 style="color: #f97316;">AUTOSPORT</h2>
          <p>Hola <strong>${usuario.nombre}</strong>,</p>
          <p>Has solicitado restablecer tu contraseña para ingresar al sistema de inventario.</p>
          <p>Haz clic en el siguiente botón para crear una nueva clave (este enlace vence en 1 hora):</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #f97316; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0;">Restablecer Contraseña</a>
          <p style="font-size: 12px; color: #9ca3af;">Si no solicitaste este cambio, puedes ignorar este correo.</p>
        </div>
      `,
    }

    await sgMail.send(msg)
    res.json({ message: 'Si el usuario existe en el sistema, recibirá un enlace de recuperación.' })
  } catch (err) {
    console.error('Error SendGrid:', err)
    res.status(500).json({ error: 'Error al enviar el correo de recuperación' })
  }
}

// RESTABLECER CONTRASEÑA
exports.restablecerPassword = async (req, res) => {
  const { token, password } = req.body

  if (!token || !password) {
    return res.status(400).json({ error: 'Token y nueva contraseña requeridos' })
  }

  const passLimpia = String(password).trim()

  if (passLimpia.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW() AND activo = TRUE',
      [token]
    )
    const usuario = rows[0]

    if (!usuario) {
      return res.status(400).json({ error: 'El enlace es inválido o ha expirado.' })
    }

    const hashedPassword = await bcrypt.hash(passLimpia, 10)

    await pool.query(
      'UPDATE usuarios SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, usuario.id]
    )

    for (const k in intentos) delete intentos[k]

    res.json({ message: 'Contraseña actualizada correctamente. Ya puedes iniciar sesión.' })
  } catch (err) {
    console.error('[RESET ERROR]', err)
    res.status(500).json({ error: err.message })
  }
}