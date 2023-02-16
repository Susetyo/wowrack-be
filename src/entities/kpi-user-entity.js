const Division = require('@/modules/division/division.model')
const KPIUser = require('@/modules/kpi-user/kpi-user.model')
const Position = require('@/modules/position/position.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const config = require('@/config')
const UserEntity = require('@/entities/user-entity')
const employeeStatus = require('@/constant/employee-status')

class KPIUserEntity {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.kpiUserRepository = new Repository(KPIUser)
    this.positionRepository = new Repository(Position)
    this.userRepository = new Repository(User)
    this.userEntity = new UserEntity()
  }

  async createNewKPIUser(data) {
    const division = await this.divisionRepository.findById(data.divisionId)

    let user = await this.userRepository.findOne({
      fullname: data.supportCoordinator,
      division: division._id,
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    })

    // if user does not exists, create new user
    if (!user) {
      const position = await this.positionRepository
        .findOne({
          name: 'Employee',
          deletedAt: { $eq: null },
        })
        .select('_id')

      user = await this.userEntity.createNewUser({
        fullname: data.supportCoordinator,
        password: config.DEFAULT_PASSWORD,
        birthdate: null,
        birthplace: null,
        position: position?._id ?? null,
        division: division._id,
        createdBy: data.createdBy,
      })

      // push new user to the division.employees array
      division.employees.push(user._id)
      await division.save()
    }

    // create kpiuser data
    return await this.kpiUserRepository.create({
      kpi: data.kpiId,
      division: division._id,
      user: user._id,
      biWeeklyData: data.biWeekly,
      createdBy: data.createdBy,
    })
  }
}

module.exports = KPIUserEntity
