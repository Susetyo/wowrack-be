const Division = require('@/modules/division/division.model')
const Media = require('@/modules/media/media.model')
const KPI = require('@/modules/kpi/kpi.model')
const KPIUser = require('@/modules/kpi-user/kpi-user.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const KPIEntity = require('@/entities/kpi-entity')
const KPIUserEntity = require('@/entities/kpi-user-entity')
const kpiStatus = require('@/constant/kpi-status')
const employeeStatus = require('@/constant/employee-status')
const mongoose = require('mongoose')

class KPIHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.mediaRepository = new Repository(Media)
    this.kpiRepository = new Repository(KPI)
    this.kpiUserRepository = new Repository(KPIUser)
    this.userRepository = new Repository(User)
    this.kpiEntity = new KPIEntity()
    this.kpiUserEntity = new KPIUserEntity()
  }

  async createKPIHandler(data, userId) {
    const division = await this.divisionRepository
      .findOne({
        _id: data.division,
        deletedAt: { $eq: null },
      })
      .select('title employees')

    if (!division) {
      throwError(404, 'Division not found')
    }

    const kpiData = {
      _id: new mongoose.Types.ObjectId(),
      title: data.title,
      dateFrom: data.dateFrom,
      dateTo: data.dateTo,
      type: data.type,
      division: data.division,
      employees: [],
      document: data.document,
      status: kpiStatus.OPEN,
      createdBy: userId,
    }

    // iterate over excel parse result
    for (const row of data.kpiData) {
      // create kpiuser data
      const kpiUser = await this.kpiUserEntity.createNewKPIUser({
        kpiId: kpiData._id,
        divisionId: division._id,
        supportCoordinator: row.supportCoordinator,
        biWeekly: row.biWeekly,
        createdBy: data.createdBy,
      })

      // push userId of the kpiuser's data to kpi's employees array
      kpiData.employees.push(kpiUser.user)
    }

    // calculate kpi score
    kpiData.score = await this.kpiEntity.calculateKPIScore(kpiData._id)

    // create new kpi
    const kpi = await this.kpiRepository.create(kpiData)

    // get kpiuser data
    const kpiUser = await this.kpiUserRepository.find({
      filter: {
        kpi: kpi._id,
        division: division._id,
      },
      populate: [
        {
          path: 'user',
          select: 'fullname',
        },
      ],
      sort: 'createdAt',
    })

    return {
      _id: kpi._id,
      title: kpi.title,
      dateFrom: kpi.dateFrom,
      dateTo: kpi.dateTo,
      type: kpi.type,
      division: {
        _id: division._id,
        title: division.title,
      },
      document: await this.mediaRepository
        .findById(kpi.document)
        .select('filename mimetype path fullpath'),
      kpiData: kpiUser.map((ku) => {
        return {
          supportCoordinator: ku.user.fullname,
          biWeekly: ku.biWeeklyData,
        }
      }),
      createdAt: kpi.createdAt,
      score: kpi.score,
    }
  }

  async getListKPIHandler(query) {
    const payload = {
      skip: query?.skip,
      limit: query?.limit,
      page: query?.page,
      perPage: query?.perPage,
    }

    payload.filter = {
      deletedAt: { $eq: null },
    }

    if (query?.division) {
      payload.filter.division = query.division
    }

    if (query?.keyword) {
      payload.filter.title = { $regex: query.keyword, $options: 'i' }
    }

    payload.populate = [
      {
        path: 'division',
        select: 'title',
      },
    ]

    const result = await this.kpiRepository.findAndCount(payload)
    result.list = result.list.map((kpi) => {
      return {
        _id: kpi._id,
        title: kpi.title,
        type: kpi.type,
        division: kpi.division,
        dateFrom: kpi.dateFrom,
        dateTo: kpi.dateTo,
        status: kpi.status,
      }
    })

    return result
  }

  async getDetailKPIHandler(id) {
    const kpi = await this.kpiRepository
      .findOne({
        _id: id,
        deletedAt: { $eq: null },
      })
      .populate([
        {
          path: 'division',
          select: 'title',
        },
      ])

    if (!kpi) {
      throwError(404, 'KPI not found')
    }

    const kpiUser = await this.kpiUserRepository.find({
      filter: {
        kpi: kpi._id,
        division: kpi.division,
      },
      populate: [
        {
          path: 'user',
          select: 'fullname',
        },
      ],
      sort: 'createdAt',
    })

    return {
      _id: kpi._id,
      title: kpi.title,
      dateFrom: kpi.dateFrom,
      dateTo: kpi.dateTo,
      type: kpi.type,
      division: kpi.division,
      document: await this.mediaRepository
        .findById(kpi.document)
        .select('filename mimetype path fullpath'),
      kpiData: kpiUser.map((ku) => {
        return {
          supportCoordinator: ku.user.fullname,
          biWeekly: ku.biWeeklyData,
        }
      }),
      createdAt: kpi.createdAt,
    }
  }

  async updateKPIHandler(id, data, userId) {
    let kpi = await this.kpiRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!kpi) {
      throwError(404, 'KPI not found')
    }

    // get kpi's division data
    let division = await this.divisionRepository.findById(kpi.division)

    const isKPIDocumentChanged = data?.document
      ? data.document !== String(kpi.document)
      : false

    const isKPIDivisionChanged = data?.division
      ? data.division !== String(kpi.division)
      : false

    // handle if kpi's document or division was changed
    if (isKPIDocumentChanged || isKPIDivisionChanged) {
      // override kpi.employees array into an empty array
      // and kpi score to 0
      kpi.employees = []
      kpi.score = 0

      // delete kpi's kpiusers data
      await this.kpiUserRepository.deleteMany({
        kpi: kpi._id,
      })

      // set initial payload for creating kpiusers data
      const kpiUserPayload = {
        kpiId: kpi._id,
        divisionId: division._id,
        createdBy: userId,
      }

      // delete old kpi's document if it was changed
      if (isKPIDocumentChanged) {
        await this.kpiEntity.deleteKPIDocument(kpi.document)
      }

      // handle if kpi's division was changed
      if (isKPIDivisionChanged) {
        // assign new division for kpi
        division = await this.divisionRepository.findById(data.division)
        kpi.division = division._id

        kpiUserPayload.divisionId = division._id
      }

      for (const row of data.kpiData) {
        // create kpi's new kpiusers data
        kpiUserPayload.supportCoordinator = row.supportCoordinator
        kpiUserPayload.biWeekly = row.biWeekly

        const kpiUser = await this.kpiUserEntity.createNewKPIUser(
          kpiUserPayload
        )

        // push userId of the kpiuser's data into kpi.employees array
        kpi.employees.push(kpiUser.user)
      }

      // calculate kpi score
      kpi.score = await this.kpiEntity.calculateKPIScore(kpi._id)

      await kpi.save()
    }

    await this.kpiRepository.updateById(id, data)

    // get updated kpi
    kpi = await this.kpiRepository.findById(id)

    // get kpiuser data
    const kpiUser = await this.kpiUserRepository.find({
      filter: {
        kpi: kpi._id,
        division: division._id,
      },
      populate: [
        {
          path: 'user',
          select: 'fullname',
        },
      ],
      sort: 'createdAt',
    })

    return {
      _id: kpi._id,
      title: kpi.title,
      dateFrom: kpi.dateFrom,
      dateTo: kpi.dateTo,
      type: kpi.type,
      division: {
        _id: division._id,
        title: division.title,
      },
      document: await this.mediaRepository
        .findById(kpi.document)
        .select('filename mimetype path fullpath'),
      kpiData: kpiUser.map((ku) => {
        return {
          supportCoordinator: ku.user.fullname,
          biWeekly: ku.biWeeklyData,
        }
      }),
      createdAt: kpi.createdAt,
    }
  }

  async deleteKPIHandler(id) {
    const kpi = await this.kpiRepository.findOne({
      _id: id,
      deletedAt: { $eq: null },
    })

    if (!kpi) {
      throwError(404, 'KPI not found')
    }

    // delete all kpi's kpiuser data
    await this.kpiUserRepository.deleteMany({
      kpi: kpi._id,
    })

    // delete kpi's document
    await this.kpiEntity.deleteKPIDocument(kpi.document)

    // delete kpi
    return await this.kpiRepository.deleteById(id)
  }

  async checkUsersInDivisionHandler(data) {
    const division = await this.divisionRepository.findOne({
      _id: data.division,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    for (const row of data.kpiData) {
      row.isEmployeeExists = await this.userRepository.any({
        fullname: row.supportCoordinator,
        division: division._id,
        status: employeeStatus.ACTIVE,
        deletedAt: { $eq: null },
      })
    }

    return data.kpiData
  }
}

module.exports = KPIHandler
