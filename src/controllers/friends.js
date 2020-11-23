const { Friends } = require('../models')
const response = require('../helpers/response')
const joi = require('joi')

module.exports = {
  createFriends: async (req, res) => {
    try {
      const { id } = req.user
      const schema = joi.object({
        phone: joi.string().required(),
        name: joi.string(),
        about: joi.string()
      })
      let { value, error } = schema.validate(req.body)
      let avatar = ''
      if (req.file) {
        const { filename } = req.file
        avatar = `uploads/${filename}`
        value = {
          ...value,
          avatar
        }
      } else {
        avatar = undefined
      }

      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }
      value = {
        ...value,
        user_id: id
      }
      const results = await Friends.create(value)
      console.log(results)
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
