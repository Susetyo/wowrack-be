const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({
  passError: true,
})

const {
  createKPISchema,
  getKPIByIdSchema,
  updateKPISchema,
  checkUsersInDivisionSchema,
} = require('@/modules/kpi/kpi.schema')

const KPIController = require('@/modules/kpi/kpi.controller')
const kpiController = new KPIController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get(
  '/',
  auth.required,
  pagination.parse,
  pagination.paging,
  kpiController.getList
)

router.get(
  '/logs',
  auth.required,
  pagination.parse,
  pagination.paging,
  kpiController.getKPILog
)

router.post(
  '/create',
  auth.required,
  validator.body(createKPISchema),
  kpiController.create
)

router.get(
  '/:id',
  auth.required,
  validator.params(getKPIByIdSchema),
  kpiController.getDetail
)

router.put(
  '/:id',
  auth.required,
  validator.params(getKPIByIdSchema),
  validator.body(updateKPISchema),
  kpiController.update
)

router.delete(
  '/delete/:id',
  auth.required,
  validator.params(getKPIByIdSchema),
  kpiController.delete
)

router.post(
  '/check-users-division',
  auth.required,
  validator.body(checkUsersInDivisionSchema),
  kpiController.checkUsersInDivision
)

module.exports = router
