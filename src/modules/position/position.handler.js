const Position = require('@/modules/position/position.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')

class EmployeePositionHandler {
  constructor() {
    this.positionRepository = new Repository(Position)
    this.userRepository = new Repository(User)
  }

  async createEmployeePositionHandler(data) {
    return await this.positionRepository.create(data)
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

    const result = await this.positionRepository.findAndCount(payload)
    result.list = result.list.map((position) => {
      return {
        _id: position._id,
        name: position.name,
      }
    })

    return result
  }

  async getDetailEmployeePositionHandler(id) {
    const position = await this.positionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!position) {
      throwError(404, 'Position not found')
    }

    return position
  }

  async updateEmployeePositionHandler(id, data) {
    const position = await this.positionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!position) {
      throwError(404, 'Position not found')
    }

    return await this.positionRepository.updateById(id, data)
  }

  async deleteEmployeePositionHandler(id) {
    const position = await this.positionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!position) {
      throwError(404, 'Position not found')
    }

    const employeeCount = await this.userRepository.count({
      position: position._id,
      deletedAt: { $eq: null },
    })

    if (employeeCount > 0) {
      throwError(
        400,
        'Position data has been connected to employee data and cannot be deleted'
      )
    }

    return await this.positionRepository.deleteById(id)
  }
}

module.exports = EmployeePositionHandler
