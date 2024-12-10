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
  const users = await User
    .find({})
  response.json(users)
})

usersRouter.get('/:username', async (request, response, next) => {
  try {
    const token = getTokenFrom(request)

    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET)
      loggedUserId = decodedToken?.id
    }

    const { username } = request.params
    const user = await User.findOne({ username })

    if (!user) {
      return response.status(404).json({ error: 'Usuario no encontrado' })
    }

    const isFollowing = loggedUserId ? user.followers.includes(loggedUserId) : false

    response.json({ ...user.toJSON(), isFollowing })
  } catch (error) {
    next(error)
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

usersRouter.put('/:username', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Invalid token' })
    }

    const userId = decodedToken.id 
    const { username } = request.params 

    // Gestionar seguidores del usuario que va a ser seguido
    const userToFollow = await User.findOne({ username })

    if (!userToFollow) {
      console.error('Usuario no encontrado con username:', username)
      return response.status(404).json({ error: 'User not found' })
    }

    const followers = userToFollow.followers || []
    const followerIndex = followers.indexOf(userId)

    if (followerIndex === -1) {
      followers.push(userId)
    } else {
      followers.splice(followerIndex, 1)
    }

    userToFollow.followers = followers
    const updatedUserToFollow = await userToFollow.save()

    // Gestionar seguidos del usuario que hace la acción
    const currentUser = await User.findById(userId)

    if (!currentUser) {
      console.error('Usuario actual no encontrado con ID:', userId)
      return response.status(404).json({ error: 'Current user not found' })
    }

    const following = currentUser.following || []
    const followingIndex = following.indexOf(userToFollow._id)

    if (followingIndex === -1) {
      following.push(userToFollow._id)
    } else {
      following.splice(followingIndex, 1)
    }

    currentUser.following = following
    await currentUser.save()

    // Devolver el usuario actualizado
    const populatedUserToFollow = await updatedUserToFollow.populate('followers', { username: 1, name: 1, imageUrl: 1 })
    // Comprobación necesaria para mostrar el botón follow o unfollow
    const isFollowing = populatedUserToFollow.followers.includes(userId)

    response.json({
      ...populatedUserToFollow.toJSON(),
      isFollowing,
    })
  } catch (error) {
    next(error)
  }
})

module.exports = usersRouter