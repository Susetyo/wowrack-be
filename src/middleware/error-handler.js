function errorHandler(err, req, res, next) {
  let code = err?.statusCode || 500
  let message = err?.message || 'Internal Server Error'
  let stack = err?.stack ?? {}

  if (err && err.error && err.error.isJoi) {
    code = 422
    message = err.error.toString()
    stack = err.error.stack
  }

  console.error(stack)

  return res.status(code).send({
    error: true,
    code,
    message,
  })
}

module.exports = errorHandler
