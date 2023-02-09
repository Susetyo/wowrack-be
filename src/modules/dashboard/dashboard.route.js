const express = require('express')
const router = express.Router()

const DashboardController = require('@/modules/dashboard/dashboard.controller')
const dashboardController = new DashboardController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get('/summary', auth.required, dashboardController.summary)
router.get(
  '/employee-list',
  auth.required,
  pagination.parse,
  pagination.paging,
  dashboardController.getListEmployee
)

module.exports = router
