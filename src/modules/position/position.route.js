const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({
  passError: true,
})

const {
  createEmployeePositionSchema,
  getEmployeePositionByIdSchema,
  updateEmployeePositionSchema,
} = require('@/modules/position/position.schema')

const EmployeePositionController = require('@/modules/position/position.controller')
const employeePositionController = new EmployeePositionController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get(
  '/',
  auth.required,
  pagination.parse,
  pagination.paging,
  employeePositionController.getList
)

router.post(
  '/create',
  auth.required,
  validator.body(createEmployeePositionSchema),
  employeePositionController.create
)

router.get(
  '/:id',
  auth.required,
  validator.params(getEmployeePositionByIdSchema),
  employeePositionController.getDetail
)

router.put(
  '/:id',
  auth.required,
  validator.params(getEmployeePositionByIdSchema),
  validator.body(updateEmployeePositionSchema),
  employeePositionController.update
)

router.delete(
  '/delete/:id',
  auth.required,
  validator.params(getEmployeePositionByIdSchema),
  employeePositionController.delete
)

module.exports = router
