class CustomError extends Error {
  constructor(statusCode, message, err = null) {
    super(message)

    if (err) {
      this.stack = err.stack
    } else {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, CustomError)
      }
    }

    this.statusCode = statusCode
  }
}

module.exports = CustomError
