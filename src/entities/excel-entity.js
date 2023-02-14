const excel2json = require('convert-excel-to-json')

const convert = async function (config) {
  try {
    return excel2json(config)
  } catch (error) {
    throw new Error(error)
  }
}

module.exports = { convert }
