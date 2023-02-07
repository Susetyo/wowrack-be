const AuthHandler = require('@/modules/auth/auth.handler')
const authHandler = new AuthHandler()

class AuthController {
  async login(req, res, next) {
    try {
      const { body } = req
      const response = await authHandler.requestAccessTokenHandler(body)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req, res, next) {
    try {
      const { userId } = req
      const response = await authHandler.getProfileHandler(userId)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { userId, body } = req
      await authHandler.updateProfileHandler(userId, body)

      res.send({})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = AuthController
