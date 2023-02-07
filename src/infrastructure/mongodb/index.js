const mongoose = require('mongoose')

const connect = (uri) => {
  const conn = mongoose.createConnection(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })

  conn.on('error', (err) =>
    console.error('Unable to connect to MongoDB database:', err)
  )
  conn.once('open', function () {
    console.log('Connected to MongoDB database', uri)
  })

  return conn
}

const createConnection = (uri) => {
  return connect(uri)
    .on('error', (err) => {
      console.error(err)
    })
    .on('disconnected', () => connect(uri))
}

module.exports = {
  createConnection,
}
