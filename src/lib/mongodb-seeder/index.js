require('dotenv').config()

const {
  createConnection,
  closeConnection,
} = require('../../infrastructure/mongodb')

const positionSeeder = require('./position')
const divisionSeeder = require('./division')
const userSeeder = require('./user')

async function seedDatabase() {
  // connect to mongodb
  await createConnection()

  await divisionSeeder()
  await positionSeeder()
  await userSeeder()
}

// close connection when success/error
seedDatabase()
  .then(async () => {
    console.log('Database seeded successfully')
    await closeConnection()
    process.exit()
  })
  .catch(async (error) => {
    console.log(error)
    await closeConnection()
    process.exit()
  })
