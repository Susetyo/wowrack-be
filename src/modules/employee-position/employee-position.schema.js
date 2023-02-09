const joi = require('joi')
const { objectId } = require('@/constant/json-schema')

const createEmployeePositionSchema = joi.object({
  name: joi.string().required(),
})

const getEmployeePositionByIdSchema = joi.object({
  id: objectId.required(),
})

const updateEmployeePositionSchema = joi.object({
  name: joi.string().optional(),
})

module.exports = {
  createEmployeePositionSchema,
  getEmployeePositionByIdSchema,
  updateEmployeePositionSchema,
}
