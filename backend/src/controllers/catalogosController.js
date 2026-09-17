const pool = require('../config/db')

// --- CATEGORÍAS ---
exports.listarCategorias = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY nombre ASC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.crearCategoria = async (req, res) => {
  const { nombre } = req.body
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

  try {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'La categoría ya existe' })
    res.status(500).json({ error: err.message })
  }
}

exports.actualizarCategoria = async (req, res) => {
  const { id } = req.params
  const { nombre } = req.body
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

  try {
    const { rows } = await pool.query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre.trim(), id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Categoría no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.eliminarCategoria = async (req, res) => {
  const { id } = req.params
  try {
    // Verificar si está en uso por algún accesorio
    const { rows: uso } = await pool.query('SELECT id FROM accesorios WHERE categoria_id = $1 LIMIT 1', [id])
    if (uso.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: existen accesorios asignados a esta categoría.' })
    }

    await pool.query('DELETE FROM categorias WHERE id = $1', [id])
    res.json({ mensaje: 'Categoría eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// --- UBICACIONES ---
exports.listarUbicaciones = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM ubicaciones ORDER BY nombre ASC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.crearUbicacion = async (req, res) => {
  const { nombre } = req.body
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

  try {
    const { rows } = await pool.query(
      'INSERT INTO ubicaciones (nombre) VALUES ($1) RETURNING *',
      [nombre.trim()]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'La ubicación ya existe' })
    res.status(500).json({ error: err.message })
  }
}

exports.actualizarUbicacion = async (req, res) => {
  const { id } = req.params
  const { nombre } = req.body
  if (!nombre || !nombre.trim()) return res.status(400).json({ error: 'El nombre es obligatorio' })

  try {
    const { rows } = await pool.query(
      'UPDATE ubicaciones SET nombre = $1 WHERE id = $2 RETURNING *',
      [nombre.trim(), id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Ubicación no encontrada' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.eliminarUbicacion = async (req, res) => {
  const { id } = req.params
  try {
    const { rows: uso } = await pool.query('SELECT id FROM accesorios WHERE ubicacion_id = $1 LIMIT 1', [id])
    if (uso.length > 0) {
      return res.status(400).json({ error: 'No se puede eliminar: existen accesorios en esta ubicación.' })
    }

    await pool.query('DELETE FROM ubicaciones WHERE id = $1', [id])
    res.json({ mensaje: 'Ubicación eliminada' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}