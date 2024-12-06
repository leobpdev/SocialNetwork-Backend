const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

usersRouter.get('/', async (request, response) => {
  try {
    const token = getTokenFrom(request) // Obtiene el token del request

    if (token) {
      try {
        const decodedToken = jwt.verify(token, process.env.SECRET) // Verifica el token
        const userId = decodedToken?.id // Obtiene el ID del usuario del token

        if (userId) {
          // Busca solo el usuario cuyo ID coincide con el token
          users = await User
            .find({ _id: userId })
          //.populate('publications', { content: 1, important: 1 })
        }
      } catch (error) {
        console.error('Token no válido:', error.message)
        return response.status(401).json({ error: 'Token inválido o expirado' })
      }
    }
    else {
      // Si no hay token válido o no se especificó un usuario, devuelve todos los usuarios
      users = await User
        .find({})
      //.populate('publications', { content: 1, important: 1 })
    }

    response.json(users)
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message)
    response.status(500).json({ error: 'Error interno del servidor' })
  }
})


usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  const saltRounds = 10
  const passwordHash = await bcryptjs.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

module.exports = usersRouter