const UserHandler = require('@/modules/user/user.handler')
const userHandler = new UserHandler()

const LogHandler = require('@/modules/log/log.handler')
const logHandler = new LogHandler()

class UserController {
  async create(req, res, next) {
    try {
      const { body, userId } = req
      const response = await userHandler.createUserHandler(body, userId)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.USER,
        action: logHandler.action.CREATE,
        data: body,
        description: 'Administrator Creates User/Employee',
      })

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getList(req, res, next) {
    try {
      const { query } = req
      const response = await userHandler.getListUserHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { slug } = params
      const response = await userHandler.getDetailUserHandler(slug)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const { body, params } = req
      const { id } = params
      await userHandler.updateUserHandler(id, body)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.USER,
        action: logHandler.action.UPDATE,
        id: id,
        data: body,
        description: 'Administrator Updates User/Employee',
      })

      res.send({})
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      await userHandler.deleteUserHandler(id)

      // insert log
      await logHandler.createLogHandler({
        req,
        module: logHandler.module.USER,
        action: logHandler.action.DELETE,
        id: id,
        description: 'Administrator Deletes User/Employee',
      })

      res.send({})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = UserController
