const router = require('express').Router()
const errorHandler = require('@/middleware/error-handler')

const authRoute = require('@/modules/auth/auth.route')
const dashboardRoute = require('@/modules/dashboard/dashboard.route')
const divisionRoute = require('@/modules/division/division.route')
const employeeRoute = require('@/modules/employee/employee.route')
const employeePositionRoute = require('@/modules/employee-position/employee-position.route')
const mediaRoute = require('@/modules/media/media.route')

router.get('/', function (req, res) {
  return res.status(200).send('OK')
})

router.use('/api/auth', authRoute)
router.use('/api/dashboard', dashboardRoute)
router.use('/api/division', divisionRoute)
router.use('/api/employee', employeeRoute)
router.use('/api/employee-position', employeePositionRoute)
router.use('/api/media', mediaRoute)

// use error handler
router.use(errorHandler)

module.exports = router
