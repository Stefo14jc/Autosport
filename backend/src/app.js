const express  = require('express')
const cors     = require('cors')
const helmet   = require('helmet')
const morgan   = require('morgan')
require('dotenv').config()

const authRoutes        = require('./routes/authRoutes')
const usuariosRoutes    = require('./routes/usuariosRoutes')
const accesoriosRoutes   = require('./routes/accesoriosRoutes')
const movimientosRoutes = require('./routes/movimientosRoutes')
const ubicacionesRoutes = require('./routes/ubicacionesRoutes')
const categoriasRoutes = require('./routes/categoriasRoutes')
const app = express()

app.use(helmet())

app.use(cors({ 
  origin: [
    'http://localhost:5173', 
    'https://autosport-gilt.vercel.app'
  ], 
  credentials: true 
}))

app.use(morgan('dev'))
app.use(express.json())

app.use('/api/auth',         authRoutes)
app.use('/api/usuarios',     usuariosRoutes)
app.use('/api/accesorios',    accesoriosRoutes)
app.use('/api/movimientos',  movimientosRoutes)
app.use('/api/ubicaciones',  ubicacionesRoutes)
app.use('/api/categorias', categoriasRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`AUTOSPORT API corriendo en puerto ${PORT}`))