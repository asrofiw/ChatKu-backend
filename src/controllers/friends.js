const { User, Friends, Messages } = require('../models')
const response = require('../helpers/response')
const { Op } = require('sequelize')
const joi = require('joi')
const qs = require('querystring')
const { APP_URL } = process.env

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
      const isExist = await Friends.findOne({
        where: {
          phone: value.phone,
          user_id: id
        }
      })
      if (isExist) {
        return response(res, 'You already connected', {}, 400, false)
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
        user_id: id,
        user_id_friends: checkUser.id
      }
      const results = await Friends.create(value)
      if (results) {
        await Messages.update({ friendId: results.id }, {
          where: {
            [Op.or]: [{
              senderId: id,
              recepientId: checkUser.id
            }, {
              senderId: checkUser.id,
              recepientId: id
            }],
            friendId: null
          }
        })
      }
      return response(res, 'Successfully added new friend', { results }, 200)
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getFriendsByUser: async (req, res) => {
    try {
      const { id } = req.user
      let { page, limit } = req.query
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (!limit) {
        limit = 10
      } else {
        limit = parseInt(limit)
      }
      const { count, rows } = await Friends.findAndCountAll({
        where: {
          user_id: id
        },
        limit: limit,
        offset: (page - 1) * limit
      })
      if (rows.length > 0) {
        const pageInfo = {
          count: 0,
          pages: 0,
          currentPage: page,
          limitPerpage: limit,
          pathNext: null,
          pathPrev: null,
          nextLink: null,
          prevLink: null
        }
        pageInfo.count = count
        pageInfo.pages = Math.ceil(count / limit)
        const { pages, currentPage } = pageInfo
        if (currentPage < pages) {
          pageInfo.nextLink = `${APP_URL}private/friends?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
          pageInfo.pathNext = `private/friends?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
        }

        if (currentPage > 1) {
          pageInfo.prevLink = `${APP_URL}private/friends?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
          pageInfo.pathPrev = `private/friends?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
        }
        return response(res, 'List of contact', { results: rows, pageInfo }, 200)
      } else {
        return response(res, 'Friends not found', {}, 404, false)
      }
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
          user_id_friends: idFriend,
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
      if (results) {
        const friendUpdate = await results.update(value)
        if (friendUpdate) {
          return response(res, 'Successfully updated friends name', { friendUpdate })
        } else {
          return response(res, 'Failed to update friends name', {}, 400, false)
        }
      } else {
        return response(res, 'Friend not found', {}, 404, false)
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
