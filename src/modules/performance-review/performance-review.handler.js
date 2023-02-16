const KPI = require('@/modules/kpi/kpi.model')
const KPIUser = require('@/modules/kpi-user/kpi-user.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const employeeStatus = require('@/constant/employee-status')
const KPIUserEntity = require('@/entities/kpi-user-entity')

class PerformanceReviewHandler {
  constructor() {
    this.kpiRepository = new Repository(KPI)
    this.kpiUserRepository = new Repository(KPIUser)
    this.userRepository = new Repository(User)
    this.kpiUserEntity = new KPIUserEntity()
  }

  async getListHandler(query) {
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

    if (query?.division) {
      payload.filter.division = query.division
    }

    if (query?.keyword) {
      payload.filter.fullname = { $regex: query.keyword, $options: 'i' }
    }

    payload.populate = [
      {
        path: 'avatar',
        select: 'mimetype filename path fullpath',
      },
      {
        path: 'division',
        select: 'title',
      },
      {
        path: 'position',
        select: 'name',
      },
    ]

    const result = await this.userRepository.findAndCount(payload)
    result.list = await Promise.all(
      result.list.map(async (user) => {
        const averageScore = await this.kpiUserEntity.calculateAverageScore(
          user._id
        )

        return {
          _id: user._id,
          employeeID: user.employeeID,
          avatar: user.avatar,
          fullname: user.fullname,
          slug: user.slug,
          email: user.email,
          position: user.position,
          division: user.division,
          averageScore,
          performance: getPerformance(averageScore),
          createdAt: user.createdAt,
        }
      })
    )

    return result
  }

  async getDetailHandler(slug) {
    const user = await this.userRepository
      .findOne({
        slug,
        status: employeeStatus.ACTIVE,
        deletedAt: { $eq: null },
      })
      .select(
        '_id employeeID avatar fullname slug position division email phone birthdate birthplace status createdAt'
      )
      .populate([
        {
          path: 'avatar',
          select: 'mimetype filename path fullpath',
        },
        {
          path: 'division',
          select: 'title',
        },
        {
          path: 'position',
          select: 'name',
        },
      ])

    if (!user) {
      throwError(404, 'User not found')
    }

    const kpis = await this.kpiRepository.find({
      filter: {
        employees: user._id,
        deletedAt: { $eq: null },
      },
      select: 'title document',
      populate: [
        {
          path: 'document',
          select: 'name mimetype filename path fullpath',
        },
      ],
    })

    const averageScore = await this.kpiUserEntity.calculateAverageScore(
      user._id
    )

    return {
      _id: user._id,
      employeeID: user.employeeID,
      avatar: user.avatar,
      fullname: user.fullname,
      slug: user.slug,
      position: user.position,
      division: user.division,
      email: user.email,
      phone: user.phone,
      birthdate: user.birthdate,
      birthplace: user.birthplace,
      status: user.status,
      averageScore,
      performance: getPerformance(averageScore),
      kpis: kpis.map((kpi) => {
        return {
          _id: kpi._id,
          title: kpi.title,
          document: kpi.document,
        }
      }),
    }
  }
}

function getPerformance(score) {
  if (score >= 80) {
    return 'GOOD'
  } else if (score < 80 && score >= 70) {
    return 'NEED ATTENTION'
  } else {
    return 'REPRIMAND'
  }
}

module.exports = PerformanceReviewHandler
