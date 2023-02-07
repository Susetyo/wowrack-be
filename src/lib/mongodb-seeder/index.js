const mongoose = require('mongoose')
require('dotenv').config()

const position = require('../../constant/position')
const User = require('../../modules/user/user.model')

const MONGODB_URI = process.env.MONGODB_URI

async function adminSeeder() {
  console.log('Seeding super-admin user to the database...')

  const existingAdministrator = await User.findOne({
    position: position.ADMINISTRATOR,
    deletedAt: { $eq: null },
  })

  if (existingAdministrator) {
    throw new Error('Super administrator already exists')
  }

  await User.create({
    fullname: 'Administrator',
    email: 'superadmin@mail.com',
    password: 'password',
    birthdate: new Date('1990-01-01'),
    birthplace: 'Jakarta',
    phone: '081122334455',
    position: position.ADMINISTRATOR,
  })
}

async function seedDatabase() {
  mongoose
    .set('strictQuery', false)
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB database: ', MONGODB_URI))
    .catch((error) => console.log(error))

  await adminSeeder()
}

seedDatabase()
  .then(() => {
    console.log('Database seeded successfully')
    mongoose.connection.close()
    console.log('MongoDB connection closed...')
    process.exit()
  })
  .catch((error) => {
    console.log(error)
    mongoose.connection.close()
    console.log('MongoDB connection closed...')
    process.exit()
  })
