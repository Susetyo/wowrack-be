const joi = require('joi').extend(require('@joi/date'))
const { email, password, slug, objectId } = require('@/constant/json-schema')

const createUserSchema = joi.object({
  avatar: objectId.allow(null).optional(),
  fullname: joi.string().required(),
  division: objectId.allow(null).required(),
  position: objectId.required(),
  birthplace: joi.string().required(),
  birthdate: joi.date().format('YYYY-MM-DD').raw().required(),
  bio: joi.string().allow('', null).optional(),
  phone: joi.string().required(),
  email: email.required(),
  password: password.required(),
})

const getUserByIdSchema = joi.object({
  id: objectId.required(),
})

const getUserBySlugSchema = joi.object({
  slug: slug.required(),
})

const updateUserSchema = joi.object({
  avatar: objectId.allow(null).optional(),
  fullname: joi.string().optional(),
  division: objectId.allow(null).optional(),
  position: objectId.optional(),
  birthplace: joi.string().optional(),
  birthdate: joi.date().format('YYYY-MM-DD').raw().optional(),
  bio: joi.string().allow('', null).optional(),
  phone: joi.string().optional(),
  email: email.optional(),
  password: password.optional(),
})

module.exports = {
  createUserSchema,
  getUserByIdSchema,
  getUserBySlugSchema,
  updateUserSchema,
}
