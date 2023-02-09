const EmployeePosition = require('../../modules/employee-position/employee-position.model')

module.exports = async function () {
  console.log('Seeding administrator position to the database...')

  const existingPosition = await EmployeePosition.findOne({
    name: 'Administrator',
    deletedAt: { $eq: null },
  })

  if (existingPosition) {
    throw new Error('Administator position already exists')
  }

  await EmployeePosition.create({
    name: 'Administrator',
  })
}
