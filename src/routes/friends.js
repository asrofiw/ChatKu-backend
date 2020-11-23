const friends = require('../controllers/friends')
const authMiddleware = require('../middleware/auth')

const route = require('express').Router()

route.post('/private/friends', authMiddleware, friends.createFriends)
route.get('/private/friends/', authMiddleware, friends.getFriendsByUser)
route.get('/private/friends/:idFriend', authMiddleware, friends.getDetailFriends)
route.patch('/private/friends/:idFriend', authMiddleware, friends.updateFriendsName)
route.delete('/private/friends/:idFriend', authMiddleware, friends.deleteFriend)

module.exports = route
