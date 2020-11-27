const { User, Messages } = require('../models')
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
      const { idFriend } = req.params

      const schemaMessage = joi.object({
        message: joi.string().required()
      })

      let { value, error } = schemaMessage.validate(req.body)
      if (error) {
        return response(res, 'Error', { error: error.message }, 400, false)
      }
      const senderMessage = await User.findByPk(id)
      const sender = senderMessage.phone
      const recepientMessage = await User.findByPk(idFriend)
      if (recepientMessage) {
        const recepient = recepientMessage.phone
        if (sender === recepient) {
          return response(res, 'Cannot send message', {}, 500, false)
        } else {
          await Messages.update({ isLatest: false }, {
            where: {
              [Op.or]: [
                {
                  sender: sender,
                  recepient: recepient
                },
                {
                  sender: recepient,
                  recepient: sender
                }
              ],
              isLatest: true || null
            }
          })
          value = {
            ...value,
            sender,
            recepient,
            user_id: parseInt(idFriend),
            belongsToId: id,
            isRead: false,
            isLatest: true
          }
          const results = await Messages.create(value)
          io.emit(value.user_id, { sender, message: value.message })
          if (results) {
            return response(res, 'Send', { results })
          } else {
            return response(res, 'Failed to post message', {}, 400, false)
          }
        }
      } else {
        return response(res, 'Friend not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getListOfChat: async (req, res) => {
    try {
      const { id } = req.user
      const user = await User.findByPk(id)
      const results = await Messages.findAll({
        where: {
          [Op.or]: [
            { sender: user.phone },
            { recepient: user.phone }
          ],
          isLatest: true
        },
        order: [['createdAt', 'DESC']],
        include: [{
          model: User
        }]
      })
      if (results.length > 0) {
        return response(res, 'List chat', { results })
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
      const { idFriend } = req.params
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

      const sender = await User.findByPk(id)
      const friend = await User.findByPk(idFriend)
      if (friend) {
        const result = await Messages.findAll({
          where: {
            [Op.or]: [
              {
                sender: sender.phone,
                recepient: friend.phone
              },
              {
                sender: friend.phone,
                recepient: sender.phone
              }
            ]
          },
          order: [['createdAt', 'DESC']],
          limit: limit,
          offset: (page - 1) * limit
        })
        if (result) {
          await Messages.update({ isRead: true }, {
            where: {
              isRead: false || null
            }
          })
          const count = await Messages.count({
            where: {
              [Op.or]: [
                {
                  sender: sender.phone,
                  recepient: friend.phone
                },
                {
                  sender: friend.phone,
                  recepient: sender.phone
                }
              ]
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
            pageInfo.nextLink = `${APP_URL}private/message/${idFriend}?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
            pageInfo.pathNext = `private/message/${idFriend}?${qs.stringify({ ...req.query, ...{ page: page + 1 } })}`
          }

          if (currentPage > 1) {
            pageInfo.prevLink = `${APP_URL}private/message/${idFriend}?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
            pageInfo.pathPrev = `private/message/${idFriend}?${qs.stringify({ ...req.query, ...{ page: page - 1 } })}`
          }
          return response(res, `Message from id friend ${idFriend}`, { result, pageInfo })
        } else {
          return response(res, 'Message not found', {}, 404, false)
        }
      } else {
        return response(res, 'Friend not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  deleteMessage: async (req, res) => {
    try {
      const { id } = req.user
      const { idMessage } = req.params
      const findSender = await User.findByPk(id)
      const results = await Messages.findOne({
        where: {
          id: idMessage,
          sender: findSender.phone
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
