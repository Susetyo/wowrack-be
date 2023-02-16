const KPI = require('@/modules/kpi/kpi.model')
const KPIUser = require('@/modules/kpi-user/kpi-user.model')
const Division = require('@/modules/division/division.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const employeeStatus = require('@/constant/employee-status')
const kpiStatus = require('@/constant/kpi-status')
const config = require('@/config')
const _ = require('lodash')
const dayjs = require('dayjs')
const { paginator } = require('@/lib/helpers')

class DashboardHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.kpiRepository = new Repository(KPI)
    this.kpiUserRepository = new Repository(KPIUser)
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

  async getStatisticHandler(query) {
    const QUARTER_PER_MONTHS = 4
    const MONTHS_PER_YEAR = config.MONTHS.length
    const MONTH_RANGE_PER_QUARTER = MONTHS_PER_YEAR / QUARTER_PER_MONTHS

    const years = {
      start: parseInt(dayjs().format('YYYY')),
      end: parseInt(dayjs().add(1, 'year').format('YYYY')),
    }

    if (query?.year) {
      years.start = parseInt(query.year)
      years.end = years.start + 1
    }

    let months = []
    config.MONTHS.forEach((month, index) => {
      months.push({
        month,
        quarter: Math.floor(index / MONTH_RANGE_PER_QUARTER + 1),
      })
    })

    months = _(months).groupBy('quarter').value()
    months = Object.keys(months).map((key) => {
      const start = months[key][0]
      const end = months[key][months[key].length - 1]

      return {
        quarter: key,
        start: start.month,
        end: end.month,
      }
    })

    const result = []
    for (const year of Object.values(years)) {
      let i = 0

      for (let j = 1; j <= QUARTER_PER_MONTHS; j++) {
        const dateFrom = dayjs(`01 ${months[i].start} ${year}`)
          .startOf('month')
          .format('YYYY-MM-DD')

        const dateTo = dayjs(`01 ${months[i].end} ${year}`)
          .endOf('month')
          .format('YYYY-MM-DD')

        result.push({
          quarter: j,
          year,
          success: await this.kpiRepository.count({
            dateFrom: { $gte: dateFrom, $lte: dateTo },
            score: { $gte: 100 },
          }),
          failed: await this.kpiRepository.count({
            dateFrom: { $gte: dateFrom, $lte: dateTo },
            score: { $lt: 100 },
          }),
        })

        i++
      }
    }

    return result
  }

  async getEmployeeRanksHandler(query) {
    let leaderboards = await this.userRepository.aggregate([
      {
        $match: {
          status: employeeStatus.ACTIVE,
          deletedAt: { $eq: null },
        },
      },
      {
        $lookup: {
          from: 'kpiusers',
          localField: '_id',
          foreignField: 'user',
          as: 'kpiusers',
          pipeline: [
            {
              $project: {
                score: {
                  $sum: '$biWeeklyData.actual',
                },
              },
            },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          score: {
            $sum: '$kpiusers.score',
          },
        },
      },
      {
        $group: {
          _id: '$_id',
          score: {
            $sum: '$score',
          },
          entries: {
            $push: '$$ROOT',
          },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $unwind: {
          path: '$entries',
        },
      },
      {
        $replaceRoot: {
          newRoot: '$entries',
        },
      },
      {
        $setWindowFields: {
          sortBy: {
            score: -1,
          },
          output: {
            rank: {
              $documentNumber: {},
            },
          },
        },
      },
    ])

    leaderboards = await Promise.all(
      leaderboards.map(async (row) => {
        const user = await this.userRepository
          .findById(row._id)
          .select('employeeID fullname slug avatar division position')
          .populate([
            {
              path: 'avatar',
              select: 'mimetype path fullpath',
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

        return {
          id: row._id,
          employeeID: user.employeeID,
          fullname: user.fullname,
          slug: user.slug,
          avatar: user.avatar,
          division: user.division,
          position: user.position,
          rank: row.rank,
          score: row.score,
        }
      })
    )

    return paginator(leaderboards, query?.page, query?.perPage)
  }
}

module.exports = DashboardHandler
