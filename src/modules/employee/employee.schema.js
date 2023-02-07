const joi = require('joi').extend(require('@joi/date'))
const { email, password, slug, objectId } = require('@/constant/json-schema')
const position = require('@/constant/position')

const createEmployeeSchema = joi.object({
  avatar: objectId.allow(null).optional(),
  fullname: joi.string().required(),
  division: objectId.allow(null).required(),
  position: joi
    .string()
    .valid(...Object.values(position))
    .required(),
  birthplace: joi.string().required(),
  birthdate: joi.date().format('YYYY-MM-DD').raw().required(),
  bio: joi.string().allow('', null).optional(),
  phone: joi.string().required(),
  email: email.required(),
  password: password.required(),
})

const getEmployeeByIdSchema = joi.object({
  id: objectId.required(),
})

const getEmployeeBySlugSchema = joi.object({
  slug: slug.required(),
})

const updateEmployeeSchema = joi.object({
  avatar: objectId.allow(null).optional(),
  fullname: joi.string().optional(),
  division: objectId.allow(null).optional(),
  position: joi
    .string()
    .valid(...Object.values(position))
    .optional(),
  birthplace: joi.string().optional(),
  birthdate: joi.date().format('YYYY-MM-DD').raw().optional(),
  bio: joi.string().allow('', null).optional(),
  phone: joi.string().optional(),
  email: email.optional(),
  password: password.optional(),
})

module.exports = {
  createEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeeBySlugSchema,
  updateEmployeeSchema,
}
