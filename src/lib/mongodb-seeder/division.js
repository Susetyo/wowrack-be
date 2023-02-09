const Division = require('../../modules/division/division.model')
const { generateCodeModel } = require('../helpers')

module.exports = async function () {
  console.log('Seeding General Affairs division to the database...')

  const existingDivision = await Division.findOne({
    title: 'General Affairs',
    deletedAt: { $eq: null },
  })

  if (existingDivision) {
    throw new Error('General Affairs division already exists')
  }

  await Division.create({
    divisionID: await generateCodeModel({
      length: 7,
      isNumeric: true,
      model: Division,
    }),
    title: 'General Affairs',
  })
}
