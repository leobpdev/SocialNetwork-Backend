const jwt = require('jsonwebtoken')
const commentsRouter = require('express').Router()
const Comment = require('../models/comment')
const Publication = require('../models/publication')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

commentsRouter.get('/:id', async (request, response, next) => {
    try {
      const { id } = request.params
      const publication = await Publication.findById(id)
  
      if (!publication) {
        return response.status(404).json({ error: 'Publication not found' })
      }
  
      const comments = await Comment.find({ publication: publication._id })
        .populate('user', { username: 1, name: 1, imageUrl: 1 })
  
      response.json(comments)
    } catch (error) {
      next(error)
    }
  })

commentsRouter.post('/:id', async (request, response, next) => {
    try {
        const token = getTokenFrom(request)
        const { id } = request.params
        const { content } = request.body

        if (token) {
            const decodedToken = jwt.verify(token, process.env.SECRET)
            user = decodedToken?.id
        }

        if (!id || !content) {
            return response.status(400).json({ error: 'Error sending comment' })
        }

        const publication = await Publication.findById(id)
        if (!publication) {
            return response.status(404).json({ error: 'Publication not found' })
        }

        const comment = new Comment({
            user,
            publication,
            content
        })

        const savedComment = await comment.save()
        response.status(201).json(savedComment)
    } catch (error) {
        next(error)
    }
})

module.exports = commentsRouter