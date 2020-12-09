const { User, Messages, Friends } = require('../models')
const response = require('../helpers/response')
const joi = require('joi')
const { Op } = require('sequelize')
const io = require('../App')
const qs = require('querystring')
const { APP_URL } = process.env

module.exports = {
  createMessage: async (req, res) => {
    try {
      const { id } = req.user
      let { recepientId } = req.params
      recepientId = parseInt(recepientId)

      const schemaMessage = joi.object({
        message: joi.string().required()
      })

      let { value, error } = schemaMessage.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }
      const sender = await User.findByPk(id)
      const recepient = await User.findByPk(recepientId)
      if (recepient) {
        if (id === recepientId) {
          return response(res, 'Cannot send message', {}, 500, false)
        } else {
          await Messages.update({ isLatest: false }, {
            where: {
              [Op.or]: [
                {
                  senderId: id,
                  recepientId: recepientId
                },
                {
                  senderId: recepientId,
                  recepientId: id
                }
              ],
              isLatest: true || null
            }
          })
          value = {
            ...value,
            sender: sender.phone,
            recepient: recepient.phone,
            senderId: id,
            recepientId: recepientId,
            isRead: false,
            isLatest: true
          }
          const searchFriend = await Friends.findOne({
            where: {
              user_id: id,
              user_id_friends: recepientId
            }
          })
          if (searchFriend) {
            value = {
              ...value,
              friendId: searchFriend.id
            }
          }
          const results = await Messages.create(value)
          io.emit(`${recepientId}`, { id, message: value.message })
          if (results) {
            return response(res, 'Send', { results })
          } else {
            return response(res, 'Failed to post message', {}, 400, false)
          }
        }
      } else {
        return response(res, 'User not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getListOfChat: async (req, res) => {
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
      const { count, rows } = await Messages.findAndCountAll({
        where: {
          [Op.or]: [
            { senderId: id },
            { recepientId: id }
          ],
          isLatest: true
        },
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'senderDetail',
            attributes: ['id', 'name', 'phone', 'avatar', 'about']
          },
          {
            model: User,
            as: 'recepientDetail',
            attributes: ['id', 'name', 'phone', 'avatar', 'about']
          },
          {
            model: Friends,
            as: 'friendDetail',
            attributes: ['id', 'name', 'phone', 'avatar', 'about', 'user_id_friends']
          }
        ],
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
          pageInfo.nextLink = `${APP_URL}private/message/?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
          pageInfo.pathNext = `private/message/?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
        }

        if (currentPage > 1) {
          pageInfo.prevLink = `${APP_URL}private/message/?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
          pageInfo.pathPrev = `private/message/?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
        }
        return response(res, 'List chat', { results: rows, pageInfo })
      } else {
        return response(res, 'There is no chat', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getDetailChat: async (req, res) => {
    try {
      const { id } = req.user
      const { recepientId } = req.params
      let { page, limit } = req.query
      if (!page) {
        page = 1
      } else {
        page = parseInt(page)
      }
      if (!limit) {
        limit = 30
      } else {
        limit = parseInt(limit)
      }

      if (id === recepientId) {
        return response(res, 'Cannot find message', {}, 400, false)
      }
      const { count, rows } = await Messages.findAndCountAll({
        where: {
          [Op.or]: [
            {
              senderId: id,
              recepientId: recepientId
            },
            {
              senderId: recepientId,
              recepientId: id
            }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: limit,
        offset: (page - 1) * limit
      })

      if (rows.length > 0) {
        await Messages.update({ isRead: true }, {
          where: {
            isRead: false || null
          }
        })

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
          pageInfo.nextLink = `${APP_URL}private/message/${recepientId}?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
          pageInfo.pathNext = `private/message/${recepientId}?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
        }

        if (currentPage > 1) {
          pageInfo.prevLink = `${APP_URL}private/message/${recepientId}?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
          pageInfo.pathPrev = `private/message/${recepientId}?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
        }
        return response(res, `Message from id friend ${recepientId}`, { results: rows, pageInfo })
      } else {
        return response(res, 'Message not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const { id } = req.user
      const { messageId } = req.params
      const results = await Messages.findOne({
        where: {
          id: messageId,
          [Op.or]: [{ senderId: id }, { recepientId: id }]
        }
      })
      if (results) {
        await results.destroy()
        return response(res, 'Successfully deleted message')
      } else {
        return response(res, 'Message not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  }
}
