const user = require('../controllers/user')
const authMiddleware = require('../middleware/auth')

const route = require('express').Router()

// Manage Profile
route.patch('/private/users', authMiddleware, user.updateUser)
route.get('/private/users', authMiddleware, user.getUserDetail)
route.delete('/private/users', authMiddleware, user.deleteUser)

// Route for admin
route.get('/users', user.getUser)

module.exports = route
