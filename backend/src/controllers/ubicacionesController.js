const pool = require('../config/db')

exports.listar = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre FROM ubicaciones WHERE activo = TRUE ORDER BY nombre ASC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}