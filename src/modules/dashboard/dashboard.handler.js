const KPI = require('@/modules/kpi/kpi.model')
const Division = require('@/modules/division/division.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const employeeStatus = require('@/constant/employee-status')
const kpiStatus = require('@/constant/kpi-status')

class DashboardHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.kpiRepository = new Repository(KPI)
    this.userRepository = new Repository(User)
  }

  async getSummaryHandler() {
    const employeeCount = await this.userRepository.count({
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    })

    const kpiCount = await this.kpiRepository.count({
      status: kpiStatus.OPEN,
      deletedAt: { $eq: null },
    })

    const divisionCount = await this.divisionRepository.count({
      deletedAt: { $eq: null },
    })

    return {
      employeeCount,
      kpiCount,
      divisionCount,
    }
  }

  async getListEmployeeHandler(query) {
    const payload = {
      skip: query?.skip,
      limit: query?.limit,
      page: query?.page,
      perPage: query?.perPage,
    }

    payload.filter = {
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    }

    payload.populate = [
      {
        path: 'division',
        select: 'title',
      },
      {
        path: 'avatar',
        select: 'mimetype path fullpath',
      },
    ]

    const result = await this.userRepository.findAndCount(payload)
    result.list = result.list.map((employee) => {
      return {
        _id: employee._id,
        employeeID: employee.employeeID,
        avatar: employee.avatar,
        fullname: employee.fullname,
        slug: employee.slug,
        division: employee.division,
        email: employee.email,
        status: employee.status,
      }
    })

    return result
  }
}

module.exports = DashboardHandler
