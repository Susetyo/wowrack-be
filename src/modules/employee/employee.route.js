const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({
  passError: true,
})

const {
  createEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeeBySlugSchema,
  updateEmployeeSchema,
} = require('@/modules/employee/employee.schema')

const EmployeeController = require('@/modules/employee/employee.controller')
const employeeController = new EmployeeController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get(
  '/',
  auth.required,
  pagination.parse,
  pagination.paging,
  employeeController.getList
)

router.post(
  '/create',
  auth.required,
  validator.body(createEmployeeSchema),
  employeeController.create
)

router.get(
  '/:slug',
  auth.required,
  validator.params(getEmployeeBySlugSchema),
  employeeController.getDetail
)

router.put(
  '/:id',
  auth.required,
  validator.params(getEmployeeByIdSchema),
  validator.body(updateEmployeeSchema),
  employeeController.update
)

router.delete(
  '/delete/:id',
  auth.required,
  validator.params(getEmployeeByIdSchema),
  employeeController.delete
)

module.exports = router
