const bcrypt = require('bcryptjs')
const pool   = require('../config/db')

exports.listar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.crear = async (req, res) => {
  const { nombre, email, password, rol } = req.body
  const emailRegex = /^[^\s@]+@[^\s@]+\.com$/i
  
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'El correo debe tener un dominio .com válido' })
  }
  if (!nombre || !email || !password || !rol) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' })
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }
  
  try {
    const hash = await bcrypt.hash(password, 10)
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,$4) RETURNING id, nombre, email, rol',
      [nombre, email, hash, rol]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'El email ya existe' })
    res.status(500).json({ error: err.message })
  }
}

exports.actualizar = async (req, res) => {
  const { id } = req.params
  // 1. EXTRAEMOS 'password' DEL REQ.BODY PARA QUE EXISTA Y ESTÉ DEFINIDA
  const { nombre, email, password, rol, activo } = req.body

  // 2. VALIDAMOS LA CONTRASEÑA EN LA PARTE SUPERIOR (SI ES QUE VIENE UNA)
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'La contraseña debe tener al menos 6 caracteres' })
  }

  try {
    let rows;
    
    // 3. CONTROLAMOS SI SE VA A ACTUALIZAR LA CONTRASEÑA O NO
    if (password && password.trim() !== '') {
      // Si el usuario escribió una nueva contraseña, la encriptamos y actualizamos todo
      const hash = await bcrypt.hash(password, 10)
      const result = await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, activo=$4, password=$5 WHERE id=$6 RETURNING id, nombre, email, rol, activo',
        [nombre, email, rol, activo, hash, id]
      )
      rows = result.rows
    } else {
      // Si no viene contraseña (o es una activación/desactivación), no tocamos el campo password en la BD
      const result = await pool.query(
        'UPDATE usuarios SET nombre=$1, email=$2, rol=$3, activo=$4 WHERE id=$5 RETURNING id, nombre, email, rol, activo',
        [nombre, email, rol, activo, id]
      )
      rows = result.rows
    }

    if (!rows[0]) return res.status(404).json({ error: 'Usuario no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.eliminar = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('UPDATE usuarios SET activo = FALSE WHERE id = $1', [id])
    res.json({ mensaje: 'Usuario desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}