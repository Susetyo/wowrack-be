const express = require('express')
const router = express.Router()

const PerformanceReviewController = require('@/modules/performance-review/performance-review.controller')
const performanceReviewController = new PerformanceReviewController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get(
  '/',
  auth.required,
  pagination.parse,
  pagination.paging,
  performanceReviewController.getList
)

router.get('/:slug', auth.required, performanceReviewController.getDetail)

module.exports = router
