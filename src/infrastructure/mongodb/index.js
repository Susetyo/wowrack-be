const mongoose = require('mongoose')
const MONGODB_URI = process.env.MONGODB_URI

const createConnection = async function () {
  return mongoose
    .set('strictQuery', false)
    .connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log('Connected to MongoDB database: ', MONGODB_URI))
    .catch((error) => console.log(error))
}

module.exports = {
  createConnection,
}
