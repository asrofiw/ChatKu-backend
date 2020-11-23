const { User, Friends, Messages } = require('../models')
const db = require('../models')
const response = require('../helpers/response')
const joi = require('joi')

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
      const recepientMessage = await Friends.findOne({
        where: {
          id: idFriend,
          user_id: id
        }
      })
      if (recepientMessage) {
        const recepient = recepientMessage.phone
        value = {
          ...value,
          sender,
          recepient,
          user_id: id,
          friend_id: idFriend,
          isRead: false
        }
        const results = await Messages.create(value)
        if (results) {
          return response(res, 'Send', { results })
        } else {
          return response(res, 'Failed to post message', {}, 400, false)
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
      const senderPhone = await User.findByPk(id)
      const sender = senderPhone.phone
      const results = await db.sequelize.query(`SELECT id, MAX(message) as message, sender, recepient, createdAt, updatedAt
      FROM Messages WHERE sender = ${sender} GROUP BY recepient`, { type: db.sequelize.QueryTypes.SELECT })
      console.log(Messages.hasOne(Friends))
      if (results) {
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
      const sender = await User.findByPk(id)
      const friend = await Friends.findByPk(idFriend)
      if (friend) {
        const result = await Messages.findAll({
          where: {
            sender: sender.phone,
            recepient: friend.phone
          },
          order: [['createdAt', 'DESC']]
        })
        if (result) {
          await Messages.update({ isRead: true }, {
            where: {
              isRead: false
            }
          })
          return response(res, `Message from id friend ${idFriend}`, { result })
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
