const express = require('express')
const router = express.Router()

const validator = require('express-joi-validation').createValidator({
  passError: true,
})

const {
  createUserSchema,
  getUserByIdSchema,
  getUserBySlugSchema,
  updateUserSchema,
} = require('@/modules/user/user.schema')

const UserController = require('@/modules/user/user.controller')
const userController = new UserController()

const auth = require('@/middleware/auth')
const pagination = require('@/middleware/pagination')

router.get(
  '/',
  auth.required,
  pagination.parse,
  pagination.paging,
  userController.getList
)

router.post(
  '/create',
  auth.required,
  validator.body(createUserSchema),
  userController.create
)

router.get(
  '/:slug',
  auth.required,
  validator.params(getUserBySlugSchema),
  userController.getDetail
)

router.put(
  '/:id',
  auth.required,
  validator.params(getUserByIdSchema),
  validator.body(updateUserSchema),
  userController.update
)

router.delete(
  '/delete/:id',
  auth.required,
  validator.params(getUserByIdSchema),
  userController.delete
)

module.exports = router
