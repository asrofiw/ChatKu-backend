const { User } = require('../models')
const joi = require('joi')
const upload = require('../helpers/upload').single('avatar')
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
        const results = await User.findByPk(id)
        if (results !== null) {
          const schema = joi.object({
            name: joi.string().max(30)
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
            await results.update(value)
            return response(res, 'Data has been updated', { results: value })
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

  getUserDetail: async (req, res) => {
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

  getUserReceipent: async (req, res) => {
    try {
      const { id } = req.params
      console.log(id)
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

  getUser: async (req, res) => {
    try {
      const results = await User.findAll()
      return response(res, 'List of Users', { results })
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
