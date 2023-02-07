const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({
  passError: true,
})

const {
  loginSchema,
  updateProfileSchema,
} = require('@/modules/auth/auth.schema')

const AuthController = require('@/modules/auth/auth.controller')
const authController = new AuthController()

const auth = require('@/middleware/auth')

router.post('/login', validator.body(loginSchema), authController.login)
router.get('/profile', auth.required, authController.getProfile)
router.put(
  '/update-profile',
  auth.required,
  validator.body(updateProfileSchema),
  authController.updateProfile
)

module.exports = router
