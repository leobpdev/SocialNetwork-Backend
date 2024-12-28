const jwt = require('jsonwebtoken')
const messagesRouter = require('express').Router()
const Message = require('../models/message')
const User = require('../models/user')

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
        return authorization.replace('Bearer ', '')
    }
    return null
}

messagesRouter.get('/', async (request, response) => {
    const messages = await Message
        .find({})
    response.json(messages)
})

messagesRouter.get('/:username', async (request, response) => {
    try {
        const { username } = request.params
        const user = await User.findOne({ username })

        if (!user) {
            return response.status(404).json({ error: 'User not found' })
        }

        // Buscar mensajes donde el remitente o el receptor sea el usuario especificado
        const messages = await Message.find({
            $or: [{ sender: user._id }, { receiver: user._id }]
        }).populate('sender', 'username').populate('receiver', 'username')

        response.json(messages)
    } catch (error) {
        response.status(500).json({ error: 'Internal server error' })
    }
})

messagesRouter.post('/:username', async (request, response, next) => {
    try {
        const token = getTokenFrom(request)
        const { username } = request.params
        const { content } = request.body

        if (token) {
            const decodedToken = jwt.verify(token, process.env.SECRET)
            sender = decodedToken?.id
        }

        if (!username || !content) {
            return response.status(400).json({ error: 'Error sending message' })
        }

        const receiver = await User.findOne({ username: username });
        if (!receiver) {
            return response.status(404).json({ error: 'Receiver not found' });
        }

        const message = new Message({
            sender,
            receiver,
            content
        })

        const savedMessage = await message.save()
        response.status(201).json(savedMessage)
    } catch (error) {
        next(error)
    }
})

module.exports = messagesRouter