const jwt = require('jsonwebtoken')
const publicationsRouter = require('express').Router()
const Publication = require('../models/publication')
const User = require('../models/user')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

publicationsRouter.get('/', async (request, response) => {
  const publications = await Publication
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(publications)
})

publicationsRouter.put('/:id', (request, response, next) => {
  const body = request.body

  const publication = {
    content: body.content,
    important: body.important,
  }

  Publication.findByIdAndUpdate(request.params.id, publication, { new: true })
    .then(updatedPublication => {
      response.json(updatedPublication)
    })
    .catch(error => next(error))
})

publicationsRouter.post('/', async (request, response, next) => {
  try {
    const body = request.body
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Invalid token' })
    }

    const user = await User.findById(decodedToken.id)
    if (!user) {
      return response.status(404).json({ error: 'User not found' })
    }

    const publication = new Publication({
      content: body.content,
      important: body.important || false,
      user: user._id,
    })

    const savedPublication = await publication.save()
    console.log('Saved publication:', savedPublication)

    if (!Array.isArray(user.publications)) {
      console.error('Publications is not an array:', user.publications)
      user.publications = []
    }

    user.publications = user.publications.concat(savedPublication._id)
    await user.save()

    response.status(201).json(savedPublication)
  } catch (error) {
    next(error) // Asegura capturar cualquier error inesperado
  }
})


publicationsRouter.get('/:id', async (request, response) => {
  const publication = await Publication.findById(request.params.id)
  if (publication) {
    response.json(publication)
  } else {
    response.status(404).end()
  }
})

publicationsRouter.delete('/:id', async (request, response) => {
  await Publication.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = publicationsRouter
