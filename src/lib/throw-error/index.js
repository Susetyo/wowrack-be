const CustomError = require('@/entities/custom-error')

module.exports = function (statusCode = 500, message = null, err = null) {
  if (!message) {
    throw new CustomError(statusCode, 'Internal Server Error', err)
  }

  throw new CustomError(statusCode, message, err)
}
