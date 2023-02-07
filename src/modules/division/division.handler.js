const Division = require('@/modules/division/division.model')
const Employee = require('@/modules/employee/employee.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const { generateCodeModel } = require('@/lib/helpers')
const employeeStatus = require('@/constant/employee-status')

class DivisionHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.employeeRepository = new Repository(Employee)
  }

  async createDivisionHandler(data, userId) {
    return await this.divisionRepository.create({
      divisionID: await generateCodeModel({
        prefix: '',
        length: 7,
        separator: '',
        model: Division,
        isNumeric: true,
      }),
      title: data.title,
      employees: [],
      createdBy: userId,
    })
  }

  async getListDivisionHandler(query) {
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
      payload.filter.title = { $regex: query.keyword, $options: 'i' }
    }

    const result = await this.divisionRepository.findAndCount(payload)
    result.list = await Promise.all(
      result.list.map(async (division) => {
        const employeeCount = await this.employeeRepository.count({
          division: division._id,
          status: employeeStatus.ACTIVE,
          deletedAt: { $eq: null },
        })

        return {
          _id: division._id,
          divisionID: division.divisionID,
          title: division.title,
          slug: division.slug,
          employeeCount,
        }
      })
    )

    return result
  }

  async getDetailDivisionHandler(slug) {
    const division = await this.divisionRepository
      .findOne({
        slug,
        deletedAt: { $eq: null },
      })
      .populate([
        {
          path: 'employees',
          match: { status: 'active', deletedAt: { $eq: null } },
          select: 'user position',
          populate: {
            path: 'user',
            select: 'fullname slug avatar',
            populate: {
              path: 'avatar',
              select: 'path fullpath',
            },
          },
        },
      ])

    if (!division) {
      throwError(404, 'Division not found')
    }

    return {
      _id: division._id,
      divisionID: division.divisionID,
      title: division.title,
      slug: division.slug,
      employees: division.employees.map((employee) => {
        return {
          _id: employee._id,
          fullname: employee.user.fullname,
          slug: employee.user.slug,
          position: employee.position,
          avatar: employee.user.avatar,
        }
      }),
      createdAt: division.createdAt,
    }
  }

  async updateDivisionHandler(id, data) {
    const division = await this.divisionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    return await this.divisionRepository.updateById(id, data)
  }

  async deleteDivisionHandler(id) {
    const division = await this.divisionRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    if (division.employees.length >= 1) {
      throwError(
        400,
        'Division data has connected to employee data and cannot be deleted'
      )
    }

    return await this.divisionRepository.softDelete(id)
  }
}

module.exports = DivisionHandler
