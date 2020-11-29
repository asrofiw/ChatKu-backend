const user = require('../controllers/user')
const authMiddleware = require('../middleware/auth')

const route = require('express').Router()

// Manage Profile
route.patch('/private/users', authMiddleware, user.updateUser)
route.get('/private/users', authMiddleware, user.getUserLoginDetail)
route.delete('/private/users', authMiddleware, user.deleteUser)

// Route without auth
route.get('/users', user.getUser)
route.get('/users/:id', user.getUserDetail)

module.exports = route
