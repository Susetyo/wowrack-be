const AuthHandler = require('@/modules/auth/auth.handler')
const authHandler = new AuthHandler()

const LogHandler = require('@/modules/log/log.handler')
const logHandler = new LogHandler()

class AuthController {
  async login(req, res, next) {
    try {
      const { body } = req
      const response = await authHandler.requestAccessTokenHandler(body)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.AUTH,
        action: logHandler.action.LOGIN,
        description: 'Auth Login',
      })

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getProfile(req, res, next) {
    try {
      const { userId } = req
      const response = await authHandler.getProfileHandler(userId)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.AUTH,
        action: logHandler.action.GET_PROFILE,
        description: 'Get Profile',
      })

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
