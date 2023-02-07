const joi = require('joi').extend(require('@joi/date'))
const { objectId, email, password } = require('@/constant/json-schema')
const position = require('@/constant/position')

const loginSchema = joi.object({
  email: email.required(),
  password: password.required(),
})

const updateProfileSchema = joi.object({
  avatar: objectId.allow(null).optional(),
  fullname: joi.string().optional(),
  position: joi
    .string()
    .valid(...Object.values(position))
    .optional(),
  birthplace: joi.string().optional(),
  birthdate: joi.date().format('YYYY-MM-DD').optional().raw(),
  bio: joi.string().optional(),
  phone: joi.string().optional(),
  email: email.optional(),
  password: password.optional(),
})

module.exports = {
  loginSchema,
  updateProfileSchema,
}
