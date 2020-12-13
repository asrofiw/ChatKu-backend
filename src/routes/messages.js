const messages = require('../controllers/messages')
const authMiddleware = require('../middleware/auth')

const route = require('express').Router()

route.post('/private/message/:recepientId', authMiddleware, messages.createMessage)
route.get('/private/message/', authMiddleware, messages.getListOfChat)
route.get('/private/message/:recepientId', authMiddleware, messages.getDetailChat)
route.patch('/private/message/:recepientId', authMiddleware, messages.updateReadMessage)
route.delete('/private/message/:messageId', authMiddleware, messages.deleteMessage)

module.exports = route
