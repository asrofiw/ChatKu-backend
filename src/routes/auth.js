const auth = require('../controllers/auth')

const route = require('express').Router()

// Auth Routes
route.post('/auth/login', auth.loginUser)

module.exports = route
