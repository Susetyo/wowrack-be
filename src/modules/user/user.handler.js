const Division = require('@/modules/division/division.model')
const Media = require('@/modules/media/media.model')
const KPI = require('@/modules/kpi/kpi.model')
const KPIUser = require('@/modules/kpi-user/kpi-user.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const { generateCodeModel } = require('@/lib/helpers')
const employeeStatus = require('@/constant/employee-status')
const avatarEntity = require('@/entities/avatar-entity')

class UserHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.kpiRepository = new Repository(KPI)
    this.kpiUserRepository = new Repository(KPIUser)
    this.mediaRepository = new Repository(Media)
    this.userRepository = new Repository(User)
  }

  async createUserHandler(data, userId) {
    const division = await this.divisionRepository.findOne({
      _id: data.division,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    let user = await this.userRepository.create({
      employeeID: await generateCodeModel({
        prefix: '',
        length: 7,
        separator: '',
        model: User,
        isNumeric: true,
      }),
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      avatar: data.avatar,
      bio: data.bio,
      birthdate: data.birthdate,
      birthplace: data.birthplace,
      phone: data.phone,
      position: data.position,
      division: data.division,
      status: employeeStatus.ACTIVE,
      createdBy: userId,
    })

    division.employees.push(user._id)
    await division.save()

    user = await this.userRepository.findOne({ _id: user._id }).populate([
      {
        path: 'division',
        select: 'title',
      },
      {
        path: 'position',
        select: 'name',
      },
      {
        path: 'avatar',
        select: 'mimetype path fullpath',
      },
    ])

    return {
      _id: user._id,
      avatar: user.avatar,
      fullname: user.fullname,
      division: user.division,
      position: user.position,
      birthplace: user.birthplace,
      birthdate: user.birthdate,
      bio: user.bio,
      phone: user.phone ?? null,
      email: user.email,
      createdAt: user.createdAt,
    }
  }

  async getListUserHandler(query) {
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

    if (query?.keyword) {
      payload.filter.fullname = { $regex: query.keyword, $options: 'i' }
    }

    if (query?.division) {
      payload.filter.division = query.division
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
    result.list = await Promise.all(
      result.list.map(async (user) => {
        const kpiUsers = await this.kpiUserRepository.find({
          filter: {
            user: user._id,
          },
        })

        let kpiScore = 0
        for (const kpiUser of kpiUsers) {
          kpiScore += kpiUser.biWeeklyData.reduce((prev, curr) => {
            return prev + curr.actual
          }, 0)
        }

        return {
          _id: user._id,
          employeeID: user.employeeID,
          avatar: user.avatar,
          fullname: user.fullname,
          slug: user.slug,
          division: user.division,
          email: user.email,
          status: user.status,
          kpiScore,
        }
      })
    )

    return result
  }

  async getDetailUserHandler(slug) {
    const user = await this.userRepository
      .findOne({
        slug,
        status: employeeStatus.ACTIVE,
        deletedAt: { $eq: null },
      })
      .populate([
        {
          path: 'division',
          select: 'title',
        },
        {
          path: 'position',
          select: 'name',
        },
        {
          path: 'avatar',
          select: 'mimetype path fullpath',
        },
      ])

    if (!user) {
      throwError(404, 'Employee not found')
    }

    const kpiUsers = await this.kpiUserRepository.find({
      filter: {
        user: user._id,
      },
    })

    let kpiScore = 0
    for (const kpiUser of kpiUsers) {
      kpiScore += kpiUser.biWeeklyData.reduce((prev, curr) => {
        return prev + curr.actual
      }, 0)
    }

    return {
      _id: user._id,
      avatar: user.avatar,
      fullname: user.fullname,
      division: user.division,
      position: user.position,
      birthplace: user.birthplace,
      birthdate: user.birthdate,
      bio: user.bio,
      phone: user.phone ?? null,
      email: user.email,
      kpiScore,
      createdAt: user.createdAt,
    }
  }

  async updateUserHandler(id, data) {
    const user = await this.userRepository.findOne({
      _id: id,
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    })

    if (!user) {
      throwError(404, 'Employee not found')
    }

    // delete user's avatar only when user's avatar is not null
    if (user.avatar && String(user.avatar) !== data.avatar) {
      await avatarEntity.deleteAvatar(user.avatar)
    }

    // if employee's division was changed
    if (user.division !== data.division) {
      const oldDivision = await this.divisionRepository.findOne({
        _id: user.division,
        deletedAt: { $eq: null },
      })

      const newDivision = await this.divisionRepository.findOne({
        _id: data.division,
        deletedAt: { $eq: null },
      })

      if (!oldDivision || !newDivision) {
        throwError(404, 'Division not found')
      }

      // remove employee from old division and add employee to new division
      const employeeIndex = oldDivision.employees.indexOf(user._id)
      if (employeeIndex >= 0) {
        oldDivision.employees.splice(employeeIndex, 1)
        await oldDivision.save()

        newDivision.employees.push(user._id)
        await newDivision.save()
      }
    }

    return await this.userRepository.updateById(id, data)
  }

  async deleteUserHandler(id) {
    const user = await this.userRepository.findOne({
      _id: id,
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    })

    if (!user) {
      throwError(404, 'Employee not found')
    }

    const division = await this.divisionRepository.findOne({
      _id: user.division,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    // check if user belongs to any kpis
    const kpis = await this.kpiRepository.find({
      filter: {
        employees: user._id,
        deletedAt: { $eq: null },
      },
    })

    if (kpis.length > 0) {
      throwError(
        400,
        'User data has connected to KPI data and cannot be deleted'
      )
    }

    // delete user avatar from local storage if exists
    if (user.avatar) {
      await avatarEntity.deleteAvatar(user.avatar)
    }

    // remove employee from division
    const userDivisionIndex = division.employees.indexOf(user._id)
    if (userDivisionIndex >= 0) {
      division.employees.splice(userDivisionIndex, 1)
      await division.save()
    }

    // delete user's kpiusers data
    for (const kpi of kpis) {
      await this.kpiUserRepository.deleteMany({
        kpi: kpi._id,
        user: user._id,
      })

      // remove user from kpi.employees array
      const userKpiIndex = kpi.employees.indexOf(user._id)
      if (userKpiIndex >= 0) {
        kpi.employees.splice(userKpiIndex, 1)
        await kpi.save()
      }
    }

    // delete user
    return await this.userRepository.deleteById(user._id)
  }
}

module.exports = UserHandler
