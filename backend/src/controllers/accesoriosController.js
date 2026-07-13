const pool = require('../config/db')

exports.listar = async (req, res) => {
  const { q, stock_bajo, categoria_id } = req.query
  // CORREGIDO: Agregamos LEFT JOIN de ubicaciones para obtener el nombre real de la ubicación
  let query = `
    SELECT r.*, c.nombre AS categoria, u.nombre AS ubicacion
    FROM accesorios r
    LEFT JOIN categorias c ON r.categoria_id = c.id
    LEFT JOIN ubicaciones u ON r.ubicacion_id = u.id
    WHERE r.activo = TRUE
  `
  const params = []
  if (q) {
    params.push(`%${q}%`)
    query += ` AND (r.nombre ILIKE $${params.length} OR r.codigo ILIKE $${params.length})`
  }
  if (stock_bajo === 'true') {
    query += ` AND r.stock_actual <= r.stock_minimo`
  }
  if (categoria_id) {
    params.push(categoria_id)
    query += ` AND r.categoria_id = $${params.length}`
  }
  query += ' ORDER BY r.nombre ASC'
  try {
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.obtener = async (req, res) => {
  const { id } = req.params
  try {
    // CORREGIDO: Agregamos el LEFT JOIN de ubicaciones aquí también
    const { rows } = await pool.query(
      `SELECT r.*, c.nombre AS categoria, u.nombre AS ubicacion
       FROM accesorios r
       LEFT JOIN categorias c ON r.categoria_id = c.id
       LEFT JOIN ubicaciones u ON r.ubicacion_id = u.id
       WHERE r.id = $1 AND r.activo = TRUE`,
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Accesorio no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

async function generarCodigo(client) {
  const { rows } = await client.query(
    `SELECT codigo FROM accesorios WHERE codigo LIKE 'REP-%' ORDER BY codigo DESC LIMIT 1`
  )
  if (!rows[0]) return 'REP-0001'
  const ultimo = parseInt(rows[0].codigo.replace('REP-', '')) || 0
  return `REP-${String(ultimo + 1).padStart(4, '0')}`
}

exports.crear = async (req, res) => {
  // CORREGIDO: Cambiado 'ubicacion' por 'ubicacion_id'
  const { nombre, descripcion, categoria_id, precio_unitario, stock_actual, stock_minimo, ubicacion_id } = req.body
  if (!nombre || !precio_unitario) {
    return res.status(400).json({ error: 'Nombre y precio son requeridos' })
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const codigo = await generarCodigo(client)
    
    // CORREGIDO: Cambiado campo 'ubicacion' a 'ubicacion_id' en el query SQL
    const { rows } = await client.query(
      `INSERT INTO accesorios
        (codigo, nombre, descripcion, categoria_id, precio_unitario, stock_actual, stock_minimo, ubicacion_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [codigo, nombre, descripcion, categoria_id, precio_unitario, stock_actual || 0, stock_minimo || 5, ubicacion_id]
    )
    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally { client.release() }
  const precioNum = parseFloat(precio_unitario)
if (isNaN(precioNum) || precioNum <= 0) {
  return res.status(400).json({ error: 'El precio unitario debe ser mayor a cero' })
}
}

exports.actualizar = async (req, res) => {
  const { id } = req.params
  // CORREGIDO: Cambiado 'ubicacion' por 'ubicacion_id'
  const { codigo, nombre, descripcion, categoria_id, precio_unitario, stock_minimo, ubicacion_id } = req.body
  try {
    // CORREGIDO: Cambiado 'ubicacion=$7' a 'ubicacion_id=$7'
    const { rows } = await pool.query(
      `UPDATE accesorios SET
        codigo=$1, nombre=$2, descripcion=$3, categoria_id=$4,
        precio_unitario=$5, stock_minimo=$6, ubicacion_id=$7
       WHERE id=$8 AND activo=TRUE
       RETURNING *`,
      [codigo, nombre, descripcion, categoria_id, precio_unitario, stock_minimo, ubicacion_id, id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Accesorio no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.eliminar = async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('UPDATE accesorios SET activo = FALSE WHERE id = $1', [id])
    res.json({ mensaje: 'Accesorio desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.stats = async (req, res) => {
  try {
    // CORREGIDO: Cambiado 'repuestos' por 'accesorios' para que no rompa la consulta de métricas
    const [total, stockBajo, movRecientes] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM accesorios WHERE activo = TRUE'),
      pool.query('SELECT COUNT(*) FROM accesorios WHERE activo = TRUE AND stock_actual <= stock_minimo'),
      pool.query(`
        SELECT m.tipo, m.cantidad, m.created_at, r.nombre AS accesorio, u.nombre AS usuario
        FROM movimientos_stock m
        JOIN accesorios r ON m.accesorio_id = r.id
        JOIN usuarios u ON m.usuario_id = u.id
        ORDER BY m.created_at DESC LIMIT 5
      `)
    ])
    res.json({
      total_accesorios:     parseInt(total.rows[0].count),
      stock_bajo:          parseInt(stockBajo.rows[0].count),
      ultimos_movimientos: movRecientes.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
} 

exports.scanPublico = async (req, res) => {
  const { id } = req.params
  try {
    // CORREGIDO: Cambiado r.ubicacion por u.nombre AS ubicacion mediante un LEFT JOIN
    const { rows } = await pool.query(
      `SELECT r.id, r.codigo, r.nombre, r.descripcion, u.nombre AS ubicacion,
              r.precio_unitario, r.stock_actual, r.stock_minimo,
              c.nombre AS categoria
       FROM accesorios r
       LEFT JOIN categorias c ON r.categoria_id = c.id
       LEFT JOIN ubicaciones u ON r.ubicacion_id = u.id
       WHERE r.id = $1 AND r.activo = TRUE`,
      [id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Accesorio no encontrado' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}
exports.filtrar = async (req, res) => {
  const { categoria_id, ubicacion_id } = req.query
  let query = `
    SELECT a.id, a.codigo, a.nombre, a.stock_actual, a.stock_minimo,
           c.nombre AS categoria, u.nombre AS ubicacion
    FROM accesorios a
    LEFT JOIN categorias c ON a.categoria_id = c.id
    LEFT JOIN ubicaciones u ON a.ubicacion_id = u.id
    WHERE a.activo = TRUE
  `
  const params = []
  if (categoria_id) { params.push(categoria_id); query += ` AND a.categoria_id = $${params.length}` }
  if (ubicacion_id) { params.push(ubicacion_id); query += ` AND a.ubicacion_id = $${params.length}` }
  query += ' ORDER BY a.nombre ASC'
  try {
    const { rows } = await pool.query(query, params)
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}