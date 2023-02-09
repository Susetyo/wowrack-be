const Division = require('@/modules/division/division.model')
const Employee = require('@/modules/employee/employee.model')
const Media = require('@/modules/media/media.model')
const User = require('@/modules/user/user.model')
const Repository = require('@/lib/mongodb-repo')
const throwError = require('@/lib/throw-error')
const { generateCodeModel } = require('@/lib/helpers')
const employeeStatus = require('@/constant/employee-status')
const avatarEntity = require('@/entities/avatar-entity')

class EmployeeHandler {
  constructor() {
    this.divisionRepository = new Repository(Division)
    this.employeeRepository = new Repository(Employee)
    this.mediaRepository = new Repository(Media)
    this.userRepository = new Repository(User)
  }

  async createEmployeeHandler(data, userId) {
    const division = await this.divisionRepository.findOne({
      _id: data.division,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    const _user = await this.userRepository.create({
      fullname: data.fullname,
      email: data.email,
      password: data.password,
      avatar: data.avatar,
      bio: data.bio,
      birthdate: data.birthdate,
      birthplace: data.birthplace,
      phone: data.phone,
      position: data.position,
      createdBy: userId,
    })

    const _employee = await this.employeeRepository.create({
      employeeID: await generateCodeModel({
        prefix: '',
        length: 7,
        separator: '',
        model: Employee,
        isNumeric: true,
      }),
      user: _user._id,
      division: data.division,
      position: data.position,
      status: employeeStatus.ACTIVE,
      createdBy: userId,
    })

    division.employees.push(_employee._id)
    await division.save()

    const employee = await this.employeeRepository
      .findOne({ _id: _employee._id })
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
          path: 'user',
          select: 'fullname birthplace birthdate bio phone email',
          populate: {
            path: 'avatar',
            select: 'path fullpath',
          },
        },
      ])

    return {
      _id: employee._id,
      avatar: employee.user.avatar,
      fullname: employee.user.fullname,
      division: employee.division.title,
      position: employee.position.name,
      birthplace: employee.user.birthplace,
      birthdate: employee.user.birthdate,
      bio: employee.user.bio,
      phone: employee.user.phone,
      email: employee.user.email,
      createdAt: employee.ceatedAt,
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

    if (query?.keyword) {
      payload.filter.user = {
        $in: await this.userRepository.getIds({
          fullname: { $regex: query.keyword, $options: 'i' },
        }),
      }
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

  async getDetailEmployeeHandler(slug) {
    const user = await this.userRepository.findOne({ slug })

    if (!user) {
      throwError(404, 'Employee not found')
    }

    const employee = await this.employeeRepository
      .findOne({
        user: user._id,
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
          path: 'user',
          select: 'fullname birthplace birthdate bio phone email',
          populate: {
            path: 'avatar',
            select: 'path fullpath',
          },
        },
      ])

    if (!employee) {
      throwError(404, 'Employee not found')
    }

    return {
      _id: employee._id,
      avatar: employee.user.avatar,
      fullname: employee.user.fullname,
      division: employee.division.title,
      position: employee.position.name,
      birthplace: employee.user.birthplace,
      birthdate: employee.user.birthdate,
      bio: employee.user.bio,
      phone: employee.user.phone,
      email: employee.user.email,
      createdAt: employee.createdAt,
    }
  }

  async updateEmployeeHandler(id, data) {
    const employee = await this.employeeRepository.findOne({
      _id: id,
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    })

    if (!employee) {
      throwError(404, 'Employee not found')
    }

    const user = await this.userRepository.findOne({
      _id: employee.user,
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
    if (employee.division !== data.division) {
      const oldDivision = await this.divisionRepository.findOne({
        _id: employee.division,
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
      const employeeIndex = oldDivision.employees.indexOf(employee._id)
      if (employeeIndex >= 0) {
        oldDivision.employees.splice(employeeIndex, 1)
        await oldDivision.save()

        newDivision.employees.push(employee._id)
        await newDivision.save()
      }
    }

    // update user
    await this.userRepository.updateById(employee.user, data)

    // update employee
    await this.employeeRepository.updateById(id, data)

    return true
  }

  async deleteEmployeeHandler(id) {
    const employee = await this.employeeRepository.findOne({
      _id: id,
      status: employeeStatus.ACTIVE,
      deletedAt: { $eq: null },
    })

    if (!employee) {
      throwError(404, 'Employee not found')
    }

    const user = await this.userRepository.findOne({
      _id: employee.user,
      deletedAt: { $eq: null },
    })

    if (!user) {
      throwError(404, 'Employee not found')
    }

    // delete user avatar from local storage if exists
    if (user.avatar) {
      await avatarEntity.deleteAvatar(user.avatar)
    }

    const division = await this.divisionRepository.findOne({
      _id: employee.division,
      deletedAt: { $eq: null },
    })

    if (!division) {
      throwError(404, 'Division not found')
    }

    // TODO: add KPI checking validation

    // remove employee from division
    const employeeIndex = division.employees.indexOf(employee._id)
    if (employeeIndex >= 0) {
      division.employees.splice(employeeIndex, 1)
      await division.save()
    }

    // soft delete user
    await this.userRepository.softDelete(user._id)

    // soft delete employee
    await this.employeeRepository.softDelete(employee._id)

    return true
  }
}

module.exports = EmployeeHandler
