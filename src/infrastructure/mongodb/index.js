const mongoose = require('mongoose')
const config = require('../../config')

const createConnection = async function () {
  return mongoose
    .set('strictQuery', false)
    .connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() =>
      console.log('Connected to MongoDB database: ', config.MONGODB_URI)
    )
    .catch((error) => console.log(error))
}

module.exports = {
  createConnection,
}
