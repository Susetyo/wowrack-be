const Employee = require('@/modules/employee/employee.model')
const EmployeePosition = require('@/modules/employee-position/employee-position.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')

class EmployeePositionHandler {
  constructor() {
    this.employeeRepository = new Repository(Employee)
    this.employeePositionRepository = new Repository(EmployeePosition)
  }

  async createEmployeePositionHandler(data) {
    return await this.employeePositionRepository.create(data)
  }

  async getListEmployeePositionHandler(query) {
    const payload = {
      skip: query?.skip,
      limit: query?.limit,
      page: query?.page,
      perPage: query?.perPage,
    }

    payload.filter = {
      deletedAt: { $eq: null },
    }

    if (query?.keyword) {
      payload.filter.name = { $regex: query.keyword, $options: 'i' }
    }

    const result = await this.employeePositionRepository.findAndCount(payload)
    result.list = result.list.map((position) => {
      return {
        _id: position._id,
        name: position.name,
      }
    })

    return result
  }

  async getDetailEmployeePositionHandler(id) {
    const position = await this.employeePositionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!position) {
      throwError(404, 'Position not found')
    }

    return position
  }

  async updateEmployeePositionHandler(id, data) {
    const position = await this.employeePositionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!position) {
      throwError(404, 'Position not found')
    }

    return await this.employeePositionRepository.updateById(id, data)
  }

  async deleteEmployeePositionHandler(id) {
    const position = await this.employeePositionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!position) {
      throwError(404, 'Position not found')
    }

    const employeeCount = await this.employeeRepository.count({
      position: position._id,
      deletedAt: { $eq: null },
    })

    if (employeeCount > 0) {
      throwError(
        400,
        'Position data has been connected to employee data and cannot be deleted'
      )
    }

    return await this.employeePositionRepository.deleteById(id)
  }
}

module.exports = EmployeePositionHandler
