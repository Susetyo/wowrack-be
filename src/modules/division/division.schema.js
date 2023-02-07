const joi = require('joi')
const { objectId, slug } = require('@/constant/json-schema')

const createDivisionSchema = joi.object({
  title: joi.string().required(),
})

const getDivisionByIdSchema = joi.object({
  id: objectId.required(),
})

const getDivisionBySlugSchema = joi.object({
  slug: slug.required(),
})

module.exports = {
  createDivisionSchema,
  getDivisionByIdSchema,
  getDivisionBySlugSchema,
}
