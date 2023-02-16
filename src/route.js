const router = require('express').Router()
const errorHandler = require('@/middleware/error-handler')

const authRoute = require('@/modules/auth/auth.route')
const dashboardRoute = require('@/modules/dashboard/dashboard.route')
const divisionRoute = require('@/modules/division/division.route')
const kpiRoute = require('@/modules/kpi/kpi.route')
const mediaRoute = require('@/modules/media/media.route')
const performanceReviewRoute = require('@/modules/performance-review/performance-review.route')
const positionRoute = require('@/modules/position/position.route')
const userRoute = require('@/modules/user/user.route')

router.get('/', function (req, res) {
  return res.status(200).send('OK')
})

router.use('/api/auth', authRoute)
router.use('/api/dashboard', dashboardRoute)
router.use('/api/division', divisionRoute)
router.use('/api/kpi', kpiRoute)
router.use('/api/media', mediaRoute)
router.use('/api/performance-review', performanceReviewRoute)
router.use('/api/position', positionRoute)
router.use('/api/user', userRoute)

// use error handler
router.use(errorHandler)

module.exports = router
