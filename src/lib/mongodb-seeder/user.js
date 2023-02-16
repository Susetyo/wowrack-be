const Division = require('../../modules/division/division.model')
const Position = require('../../modules/position/position.model')
const User = require('../../modules/user/user.model')
const employeeStatus = require('../../constant/employee-status')
const { generateCodeModel } = require('../helpers')

module.exports = async function () {
  console.log('Seeding super-admin user to the database...')

  const adminPosition = await Position.findOne({
    name: 'Administrator',
  })

  if (!adminPosition) {
    throw new Error('Administator position was not found')
  }

  const division = await Division.findOne({
    title: 'General Affairs',
    deletedAt: { $eq: null },
  })

  if (!division) {
    throw new Error('General Affairs division was not found')
  }

  const existingAdministrator = await User.findOne({
    position: adminPosition._id,
    deletedAt: { $eq: null },
  })

  if (existingAdministrator) {
    throw new Error('Super administrator already exists')
  }

  const user = await User.create({
    employeeID: await generateCodeModel({
      length: 7,
      isNumeric: true,
      model: User,
    }),
    fullname: 'Administrator',
    email: 'superadmin@mail.com',
    password: 'password',
    birthdate: '1990-01-01',
    birthplace: 'Jakarta',
    phone: '081122334455',
    position: adminPosition._id,
    division: division._id,
    status: employeeStatus.ACTIVE,
  })

  division.employees.push(user._id)
  await division.save()
}
