const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const path = require('path')
require('express-async-errors')

const publicationsRouter = require('./controllers/publications')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const messagesRouter = require('./controllers/messages')

const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const config = require('./utils/config')

const app = express()

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())
app.use(middleware.requestLogger)

// Rutas de API
app.use('/api/publications', publicationsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/messages', messagesRouter)

// Rutas adicionales solo para entorno de prueba
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

// Redirigir todas las rutas al archivo index.html
app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, 'dist', 'index.html'))
})

// Manejo de errores y rutas desconocidas
app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app