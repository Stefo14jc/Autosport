const express  = require('express')
const cors     = require('cors')
const helmet   = require('helmet')
const morgan   = require('morgan')
require('dotenv').config()

const authRoutes        = require('./routes/authRoutes')
const usuariosRoutes    = require('./routes/usuariosRoutes')
const accesoriosRoutes   = require('./routes/accesoriosRoutes')
const movimientosRoutes = require('./routes/movimientosRoutes')
const catalogosRoutes   = require('./routes/catalogosRoutes')

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

app.use('/api/auth',        authRoutes)
app.use('/api/usuarios',    usuariosRoutes)
app.use('/api/accesorios',   accesoriosRoutes)
app.use('/api/movimientos', movimientosRoutes)

// Rutas de Catálogos (Categorías y Ubicaciones con GET, POST, PUT, DELETE)
app.use('/api',             catalogosRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`AUTOSPORT API corriendo en puerto ${PORT}`))