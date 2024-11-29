const jwt = require('jsonwebtoken')
const publicationsRouter = require('express').Router()
const Publication = require('../models/publication')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

publicationsRouter.get('/', async (request, response, next) => {
  try {
    // Intentar obtener el token del header Authorization
    const token = getTokenFrom(request)

    let publicationsWithHasLiked = []

    // Si hay un token, lo verificamos y obtenemos el userId
    if (token) {
      const decodedToken = jwt.verify(token, process.env.SECRET)
      const userId = decodedToken?.id

      // Obtener las publicaciones y añadir `hasLiked` si el token es válido
      const publications = await Publication.find({}).populate('user', { name: 1, imageUrl: 1 })
      publicationsWithHasLiked = publications.map((publication) => {
        return {
          ...publication.toJSON(),
          hasLiked: publication.likes.includes(userId),  // Añadir `hasLiked` solo si el token es válido
        }
      })
    } else {
      // Si no hay token, obtenemos las publicaciones pero sin el campo `hasLiked`
      const publications = await Publication.find({}).populate('user', { name: 1, imageUrl: 1 })
      publicationsWithHasLiked = publications.map((publication) => {
        return {
          ...publication.toJSON(),
        }
      })
    }

    response.json(publicationsWithHasLiked)  // Devolver las publicaciones con o sin `hasLiked`
  } catch (error) {
    next(error)  // Si hay un error, pasar al siguiente middleware de manejo de errores
  }
})

publicationsRouter.get('/:id', async (request, response) => {
  const publication = await Publication
      .findById(request.params.id)
      .populate('user', { username: 1, name: 1, imageUrl: 1 })
  if (publication) {
    response.json(publication)
  } else {
    response.status(404).end()
  }
})

publicationsRouter.put('/:id', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET)

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Invalid token' })
    }

    const userId = decodedToken.id
    const publication = await Publication.findById(request.params.id)

    if (!publication) {
      console.error('Publicación no encontrada con ID:', request.params.id)
      return response.status(404).json({ error: 'Publication not found' })
    }

    // Verificar si el usuario ya ha dado like
    const likes = publication.likes || []
    const userIndex = likes.indexOf(userId)

    if (userIndex === -1) {
      // Si el usuario no ha dado like, lo añadimos
      likes.push(userId)
    } else {
      // Si ya ha dado like, lo eliminamos
      likes.splice(userIndex, 1)
    }

    publication.likes = likes
    const updatedPublication = await publication.save()

    // Ahora devolvemos la publicación actualizada con la información del usuario
    const populatedPublication = await updatedPublication.populate('user', { name: 1, imageUrl: 1 })
    
    // Calculamos si el usuario que hizo la petición ya dio like a la publicación
    const hasLiked = populatedPublication.likes.includes(userId)

    // Devolvemos la publicación con el estado `hasLiked`
    response.json({
      ...populatedPublication.toJSON(),
      hasLiked,
    })
  } catch (error) {
    next(error)
  }
})

publicationsRouter.delete('/:id', async (request, response) => {
  await Publication.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = publicationsRouter
