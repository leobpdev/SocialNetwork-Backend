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
    .find({}).populate('user', { username: 1, name: 1, imageUrl:1 })
  response.json(publications)
})

publicationsRouter.get('/:id', async (request, response) => {
  const publication = await Publication.findById(request.params.id)
  if (publication) {
    response.json(publication)
  } else {
    response.status(404).end()
  }
})

publicationsRouter.put('/:id/like', async (request, response, next) => {
  try {
    const decodedToken = jwt.verify(getTokenFrom(request), process.env.SECRET);

    if (!decodedToken.id) {
      return response.status(401).json({ error: 'Invalid token' });
    }

    const userId = decodedToken.id;
    const publication = await Publication.findById(request.params.id);

    if (!publication) {
      return response.status(404).json({ error: 'Publication not found' });
    }

    // Verificar si el usuario ya ha dado like
    const likes = publication.likes || [];
    const userIndex = likes.indexOf(userId);

    if (userIndex === -1) {
      // Si no ha dado like, lo añadimos
      likes.push(userId);
    } else {
      // Si ya ha dado like, lo eliminamos (quita el like)
      likes.splice(userIndex, 1);
    }

    publication.likes = likes;
    const updatedPublication = await publication.save();  // Guardar la publicación con los likes actualizados

    response.json(updatedPublication); // Devolver la publicación actualizada
  } catch (error) {
    next(error);
  }
});

publicationsRouter.delete('/:id', async (request, response) => {
  await Publication.findByIdAndDelete(request.params.id)
  response.status(204).end()
})

module.exports = publicationsRouter
