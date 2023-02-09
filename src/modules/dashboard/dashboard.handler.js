const KPI = require('@/modules/kpi/kpi.model')
const Employee = require('@/modules/employee/employee.model')
const Division = require('@/modules/division/division.model')
const Repository = require('@/lib/mongodb-repo')
const employeeStatus = require('@/constant/employee-status')
const kpiStatus = require('@/constant/kpi-status')

class DashboardHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.employeeRepository = new Repository(Employee)
    this.kpiRepository = new Repository(KPI)
  }

  async getSummaryHandler() {
    const employeeCount = await this.employeeRepository.count({
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
        path: 'user',
        select: 'fullname slug email avatar',
        populate: {
          path: 'avatar',
          select: 'path fullpath',
        },
      },
    ]

    const result = await this.employeeRepository.findAndCount(payload)
    result.list = result.list.map((employee) => {
      return {
        _id: employee._id,
        employeeID: employee.employeeID,
        avatar: employee.user.avatar,
        fullname: employee.user.fullname,
        slug: employee.user.slug,
        division: employee.division.title,
        email: employee.user.email,
        status: employee.status,
      }
    })

    return result
  }
}

module.exports = DashboardHandler
