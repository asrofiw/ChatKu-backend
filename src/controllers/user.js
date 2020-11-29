const { User } = require('../models')
const joi = require('joi')
const upload = require('../helpers/upload').single('avatar')
const { Op } = require('sequelize')
const response = require('../helpers/response')
const multer = require('multer')

module.exports = {
  updateUser: (req, res) => {
    upload(req, res, async err => {
      if (err instanceof multer.MulterError) {
        return response(res, err.message, {}, 400, false)
      } else if (err) {
        return response(res, err.message, {}, 400, false)
      }
      try {
        const { id } = req.user
        const data = await User.findByPk(id)
        if (data !== null) {
          const schema = joi.object({
            name: joi.string().max(30),
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
          if (Object.values(value).length > 0) {
            const results = await data.update(value)
            return response(res, 'Data has been updated', { results })
          } else {
            return response(res, 'You have to fill at least one of them, if you want to change your data', {}, 400, false)
          }
        } else {
          return response(res, 'User not found', {}, 404, false)
        }
      } catch (e) {
        return response(res, 'Internal server error', { error: e.message }, 500, false)
      }
    })
  },

  getUserLoginDetail: async (req, res) => {
    try {
      const { id } = req.user
      const results = await User.findByPk(id)
      if (results !== null) {
        return response(res, `User with id ${id}`, { results })
      } else {
        return response(res, 'User not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getUserDetail: async (req, res) => {
    try {
      const { id } = req.params
      const results = await User.findByPk(id)
      if (results) {
        return response(res, `User with id ${id}`, { results })
      } else {
        return response(res, 'User not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  getUser: async (req, res) => {
    try {
      let { search } = req.query
      let phone = ''
      let name = ''
      if (!search) {
        search = ''
      } else if (typeof parseInt(search) === 'number') {
        phone = search
      } else if (search === 'string') {
        name = search
      }
      const results = await User.findAll({
        where: {
          [Op.or]: [
            {
              name: {
                [Op.substring]: name
              }
            },
            {
              phone: {
                [Op.substring]: phone
              }
            }
          ]
        }
      })
      if (results.length > 0) {
        return response(res, 'List of Users', { results })
      } else {
        return response(res, 'User not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  },

  deleteUser: async (req, res) => {
    try {
      const { id } = req.user
      const results = await User.findByPk(id)
      if (results !== null) {
        await results.destroy()
        return response(res, 'User has been deleted')
      } else {
        return response(res, 'User not found', {}, 404, false)
      }
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  }
}
