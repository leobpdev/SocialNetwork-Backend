const bcryptjs = require('bcryptjs')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
  response.json(users)
})

usersRouter.get('/:username', async (request, response) => {
  try {
    const { username } = request.params
    const user = await User.findOne({ username }) // Busca por username

    if (!user) {
      return response.status(404).json({ error: 'Usuario no encontrado' })
    }

    response.json(user)
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error.message)
    return response.status(500).json({ error: 'Error en el servidor' })
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