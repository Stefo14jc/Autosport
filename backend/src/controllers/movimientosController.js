const pool = require('../config/db')

exports.listar = async (req, res) => {
  const page  = parseInt(req.query.page)  || 1
  const limit = parseInt(req.query.limit) || 20
  const offset = (page - 1) * limit
  try {
    const { rows } = await pool.query(
      `SELECT m.*, r.nombre AS accesorio, r.codigo, u.nombre AS usuario
       FROM movimientos_stock m
       JOIN accesorios r ON m.accesorio_id = r.id
       JOIN usuarios u ON m.usuario_id = u.id
       ORDER BY m.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    )
    const { rows: total } = await pool.query('SELECT COUNT(*) FROM movimientos_stock')
    res.json({ data: rows, total: parseInt(total[0].count), page, limit })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.porAccesorio = async (req, res) => {
  const { id } = req.params
  try {
    const { rows } = await pool.query(
      `SELECT m.*, u.nombre AS usuario
       FROM movimientos_stock m
       JOIN usuarios u ON m.usuario_id = u.id
       WHERE m.accesorio_id = $1
       ORDER BY m.created_at DESC`,
      [id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.registrar = async (req, res) => {
  const { accesorio_id, tipo, cantidad, motivo, origen_qr } = req.body
  if (!accesorio_id || !tipo || !cantidad) {
    return res.status(400).json({ error: 'accesorio_id, tipo y cantidad son requeridos' })
  }
  if (!['ingreso', 'salida'].includes(tipo)) {
    return res.status(400).json({ error: 'tipo debe ser ingreso o salida' })
  }
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const { rows: rep } = await client.query(
      'SELECT stock_actual FROM accesorios WHERE id = $1 AND activo = TRUE FOR UPDATE',
      [accesorio_id]
    )
    if (!rep[0]) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Accesorio no encontrado' })
    }
    const stockAnterior = rep[0].stock_actual
    const stockNuevo = tipo === 'ingreso'
      ? stockAnterior + parseInt(cantidad)
      : stockAnterior - parseInt(cantidad)

    if (stockNuevo < 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Stock insuficiente para realizar la salida' })
    }
    await client.query('UPDATE accesorios SET stock_actual = $1 WHERE id = $2', [stockNuevo, accesorio_id])
    const { rows } = await client.query(
      `INSERT INTO movimientos_stock
        (accesorio_id, usuario_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, origen_qr)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING *`,
      [accesorio_id, req.user.id, tipo, cantidad, stockAnterior, stockNuevo, motivo, origen_qr || false]
    )
    await client.query('COMMIT')
    res.status(201).json(rows[0])
  } catch (err) {
    await client.query('ROLLBACK')
    res.status(500).json({ error: err.message })
  } finally {
    client.release()
  }
}

exports.reporte = async (req, res) => {
  const { fecha_inicio, fecha_fin } = req.query
  if (!fecha_inicio || !fecha_fin) {
    return res.status(400).json({ error: 'fecha_inicio y fecha_fin son requeridos' })
  }
  try {
    const { rows } = await pool.query(
      `SELECT
        m.id, m.tipo, m.cantidad, m.stock_anterior, m.stock_nuevo,
        m.motivo, m.origen_qr, m.created_at,
        r.codigo, r.nombre AS accesorio, u_ubic.nombre AS ubicacion, r.precio_unitario,
        r.stock_actual, r.stock_minimo,
        u.nombre AS usuario
       FROM movimientos_stock m
       JOIN accesorios r ON m.accesorio_id = r.id
       JOIN usuarios u  ON m.usuario_id  = u.id
       LEFT JOIN ubicaciones u_ubic ON r.ubicacion_id = u_ubic.id
       WHERE m.created_at BETWEEN $1 AND ($2::date + interval '1 day')
       ORDER BY m.created_at DESC`,
      [fecha_inicio, fecha_fin]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

exports.dashboardDiario = async (req, res) => {
  try {
    const [totales, porUsuario] = await Promise.all([
      pool.query(`
        SELECT
          COUNT(*)                                                    AS total_movimientos,
          COALESCE(SUM(CASE WHEN tipo='ingreso' THEN cantidad END), 0) AS total_ingresos,
          COALESCE(SUM(CASE WHEN tipo='salida'  THEN cantidad END), 0) AS total_salidas
        FROM movimientos_stock
        WHERE created_at >= CURRENT_DATE
      `),
      pool.query(`
        SELECT
          u.nombre AS usuario,
          u.rol,
          COUNT(m.id)                                                AS movimientos,
          COALESCE(SUM(CASE WHEN m.tipo='ingreso' THEN m.cantidad END), 0) AS ingresos,
          COALESCE(SUM(CASE WHEN m.tipo='salida'  THEN m.cantidad END), 0) AS salidas,
          MAX(m.created_at)                                        AS ultimo_movimiento
        FROM movimientos_stock m
        JOIN usuarios u ON m.usuario_id = u.id
        WHERE m.created_at >= CURRENT_DATE
        GROUP BY u.id, u.nombre, u.rol
        ORDER BY movimientos DESC
      `)
    ])
    res.json({
      totales:    totales.rows[0],
      porUsuario: porUsuario.rows
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}