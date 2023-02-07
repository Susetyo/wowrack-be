const router = require('express').Router()
const errorHandler = require('@/middleware/error-handler')

const authRoute = require('@/modules/auth/auth.route')
const divisionRoute = require('@/modules/division/division.route')
const employeeRoute = require('@/modules/employee/employee.route')
const mediaRoute = require('@/modules/media/media.route')

router.get('/', function (req, res) {
  return res.status(200).send('OK')
})

router.use('/api/auth', authRoute)
router.use('/api/division', divisionRoute)
router.use('/api/employee', employeeRoute)
router.use('/api/media', mediaRoute)

// use error handler
router.use(errorHandler)

module.exports = router
