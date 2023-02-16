const EmployeePositionHandler = require('@/modules/position/position.handler')
const employeePositionHandler = new EmployeePositionHandler()

class EmployeePositionController {
  async create(req, res, next) {
    try {
      const { body } = req
      const response =
        await employeePositionHandler.createEmployeePositionHandler(body)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getList(req, res, next) {
    try {
      const { query } = req
      const response =
        await employeePositionHandler.getListEmployeePositionHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      const response =
        await employeePositionHandler.getDetailEmployeePositionHandler(id)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const { body, params } = req
      const { id } = params
      await employeePositionHandler.updateEmployeePositionHandler(id, body)

      res.send({})
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      await employeePositionHandler.deleteEmployeePositionHandler(id)

      res.send({})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = EmployeePositionController
