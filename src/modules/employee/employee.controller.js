const EmployeeHandler = require('@/modules/employee/employee.handler')
const employeeHandler = new EmployeeHandler()

class EmployeeController {
  async create(req, res, next) {
    try {
      const { body, userId } = req
      const response = await employeeHandler.createEmployeeHandler(body, userId)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getList(req, res, next) {
    try {
      const { query } = req
      const response = await employeeHandler.getListEmployeeHandler(query)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async getDetail(req, res, next) {
    try {
      const { params } = req
      const { slug } = params
      const response = await employeeHandler.getDetailEmployeeHandler(slug)

      res.send(response)
    } catch (error) {
      next(error)
    }
  }

  async update(req, res, next) {
    try {
      const { body, params } = req
      const { id } = params
      await employeeHandler.updateEmployeeHandler(id, body)

      res.send({})
    } catch (error) {
      next(error)
    }
  }

  async delete(req, res, next) {
    try {
      const { params } = req
      const { id } = params
      await employeeHandler.deleteEmployeeHandler(id)

      res.send({})
    } catch (error) {
      next(error)
    }
  }
}

module.exports = EmployeeController
