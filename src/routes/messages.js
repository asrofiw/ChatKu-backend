const messages = require('../controllers/messages')
const authMiddleware = require('../middleware/auth')

const route = require('express').Router()

route.post('/private/message/:idFriend', authMiddleware, messages.createMessage)
route.get('/private/message/', authMiddleware, messages.getListOfChat)
route.get('/private/message/:idFriend', authMiddleware, messages.getDetailChat)
route.delete('/private/message/:idMessage', authMiddleware, messages.deleteMessage)

module.exports = route
