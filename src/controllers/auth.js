const { User } = require('../models')
const jwt = require('jsonwebtoken')
const joi = require('joi')
const response = require('../helpers/response')
const { APP_KEY } = process.env

module.exports = {
  loginUser: async (req, res) => {
    try {
      const schema = joi.object({
        phone: joi.string().required()
      })
      const { value, error } = schema.validate(req.body)
      if (error) {
        return response(res, 'Login failed', { error: error.message }, 400, false)
      }
      const { phone } = value
      const checkExist = await User.findOne({
        where: { phone: phone }
      })
      let id = 0
      let results = {}
      if (!checkExist) {
        results = await User.create(value)
        id = results.id
      } else {
        id = checkExist.id
      }
      const token = jwt.sign({ id }, APP_KEY, { expiresIn: '10d' })
      return response(res, 'Login successfully', { value, token: token }, 200, true)
    } catch (e) {
      return response(res, 'Internal server error', { error: e.message }, 500, false)
    }
  }
}
