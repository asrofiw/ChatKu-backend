const { User, Friends } = require('../models')
const response = require('../helpers/response')
const joi = require('joi')

module.exports = {
  createFriends: async (req, res) => {
    try {
      const { id } = req.user
      const schema = joi.object({
        phone: joi.string().required()
      })
      let { value, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }

      const checkUser = await User.findOne({
        where: {
          phone: value.phone
        }
      })
      if (!checkUser) {
        return response(res, 'User not registered', { value }, 404, false)
      }

      const checkSameUser = await User.findByPk(id)
      if (checkSameUser) {
        if (value.phone === checkSameUser.phone) {
          return response(res, 'Cannot add friend', {}, 400, false)
        }
      }

      value = {
        ...value,
        name: checkUser.name,
        avatar: checkUser.avatar,
        about: checkUser.about,
        user_id: id
      }
      const results = await Friends.create(value)
      return response(res, 'Successfully added new friend', { results }, 200)
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getFriendsByUser: async (req, res) => {
    try {
      const { id } = req.user
      const results = await Friends.findAll({
        where: {
          user_id: id
        }
      })
      return response(res, 'List of contact', { results }, 200)
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getDetailFriends: async (req, res) => {
    try {
      const { id } = req.user
      const { idFriend } = req.params
      const results = await Friends.findOne({
        where: {
          id: idFriend,
          user_id: id
        }
      })
      if (results) {
        return response(res, `Friends with id ${idFriend}`, { results })
      } else {
        return response(res, 'Friends not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  updateFriendsName: async (req, res) => {
    try {
      const { id } = req.user
      const { idFriend } = req.params
      const schemaName = joi.object({
        name: joi.string().max(30).required()
      })
      const { value, error } = schemaName.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }
      const results = await Friends.findOne({
        where: {
          id: idFriend,
          user_id: id
        }
      })
      const friendUpdate = await results.update(value)
      if (friendUpdate) {
        return response(res, 'Successfully updated friends name', { friendUpdate })
      } else {
        return response(res, 'Failed to update friends name', {}, 400, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  deleteFriend: async (req, res) => {
    try {
      const { id } = req.user
      const { idFriend } = req.params
      const results = await Friends.findOne({
        where: {
          id: idFriend,
          user_id: id
        }
      })
      if (results) {
        await results.destroy()
        return response(res, 'Successfully deleted friend')
      } else {
        return response(res, 'Friend not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  }
}
