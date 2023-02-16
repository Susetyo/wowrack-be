const Position = require('../../modules/position/position.model')

module.exports = async function () {
  console.log('Seeding administrator position to the database...')

  const existingPosition = await Position.findOne({
    name: 'Administrator',
    deletedAt: { $eq: null },
  })

  if (existingPosition) {
    throw new Error('Administator position already exists')
  }

  await Position.create({
    name: 'Administrator',
  })
}
