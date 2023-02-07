const fastCSV = require('fast-csv')
const fs = require('fs')

const parse = (file) => {
  return new Promise((resolve, reject) => {
    const data = []

    fastCSV
      .parseStream(fs.createReadStream(file), {
        objectMode: true,
        delimiter: ',',
        headers: true,
        renameHeaders: false,
      })
      .on('error', (error) => reject(error))
      .on('data', (row) => data.push(row))
      .on('end', () => resolve(data))
  })
}

module.exports = { parse }
