const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
  response.json(users)
})

usersRouter.get('/:profileToken', async (request, response) => {
  try {
    const { profileToken } = request.params

    const decodedToken = jwt.verify(profileToken, process.env.SECRET) // Verifica el token
    const userId = decodedToken?.id // Obtiene el ID del usuario del token

    users = await User.find({ _id: userId })

  } catch (error) {
    console.error('Token no válido:', error.message)
    return response.status(401).json({ error: 'Token inválido o expirado' })
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