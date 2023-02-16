const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const { generateCodeModel, generateEmployeeEmail } = require('@/lib/helpers')
const employeeStatus = require('@/constant/employee-status')

class UserEntity {
  constructor() {
    this.userRepository = new Repository(User)
  }

  async createNewUser(data) {
    data.employeeID = await generateCodeModel({
      prefix: '',
      length: 7,
      separator: '',
      model: User,
      isNumeric: true,
    })

    if (!data?.email) {
      data.email = generateEmployeeEmail(data.fullname, data.employeeID)
    }

    const user = await this.userRepository.create({
      employeeID: data.employeeID,
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      birthdate: data.birthdate,
      birthplace: data.birthplace,
      phone: data.phone,
      position: data.position,
      division: data.division,
      status: employeeStatus.ACTIVE,
      createdBy: data.createdBy,
    })

    return user
  }
}

module.exports = UserEntity
