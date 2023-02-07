const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({
  passError: true,
})

const {
  createDivisionSchema,
  getDivisionByIdSchema,
  getDivisionBySlugSchema,
} = require('@/modules/division/division.schema')

const DivisionController = require('@/modules/division/division.controller')
const divisionController = new DivisionController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get(
  '/',
  auth.required,
  pagination.parse,
  pagination.paging,
  divisionController.getList
)

router.post(
  '/create',
  auth.required,
  validator.body(createDivisionSchema),
  divisionController.create
)

router.get(
  '/:slug',
  auth.required,
  validator.params(getDivisionBySlugSchema),
  divisionController.getDetail
)

router.put(
  '/:id',
  auth.required,
  validator.params(getDivisionByIdSchema),
  validator.body(createDivisionSchema),
  divisionController.update
)

router.delete(
  '/delete/:id',
  auth.required,
  validator.params(getDivisionByIdSchema),
  divisionController.delete
)

module.exports = router
