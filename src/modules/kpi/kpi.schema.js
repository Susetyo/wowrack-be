const joi = require('joi').extend(require('@joi/date'))
const { objectId } = require('@/constant/json-schema')
const kpiType = require('@/constant/kpi-type')

const createKPISchema = joi.object({
  title: joi.string().required(),
  dateFrom: joi.date().format('YYYY-MM-DD').raw().required(),
  dateTo: joi.date().format('YYYY-MM-DD').raw().required(),
  type: joi
    .string()
    .valid(...Object.values(kpiType))
    .required(),
  division: objectId.required(),
  document: objectId.required(),
  kpiData: joi.array(),
})

const getKPIByIdSchema = joi.object({
  id: objectId.required(),
})

const updateKPISchema = joi.object({
  title: joi.string().optional(),
  dateFrom: joi.date().format('YYYY-MM-DD').raw().optional(),
  dateTo: joi.date().format('YYYY-MM-DD').raw().optional(),
  type: joi
    .string()
    .valid(...Object.values(kpiType))
    .optional(),
  division: objectId.optional(),
  document: objectId.optional(),
  kpiData: joi.array(),
})

const checkUsersInDivisionSchema = joi.object({
  division: objectId.required(),
  kpiData: joi.array(),
})

module.exports = {
  createKPISchema,
  getKPIByIdSchema,
  updateKPISchema,
  checkUsersInDivisionSchema,
}
