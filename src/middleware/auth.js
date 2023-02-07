const throwError = require('@/lib/throw-error')
const { verifyAccessToken } = require('@/lib/helpers')

const parseAuth = async (req, isAuthRequired = true) => {
  const authHeader = req.headers.authorization?.split(' ') || []
  const token = authHeader[1] || authHeader[0]

  const payload = await verifyAccessToken(token).catch((err) => {
    isAuthRequired && throwError(403, 'Please login first')
  })

  req.userId = payload?.id ?? null
  req.fullname = payload?.fullname ?? null
  req.email = payload?.email ?? null

  return payload
}

const required = async function (req, res, next) {
  try {
    await parseAuth(req)
    next()
  } catch (error) {
    next(error)
  }
}

const optional = async function (req, res, next) {
  try {
    await parseAuth(req, false)
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  required,
  optional,
}
