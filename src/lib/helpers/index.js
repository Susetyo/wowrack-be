const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Repository = require('../mongodb-repo')

const SECRET_KEY = process.env.SECRET_KEY
const JWT_TTL = process.env.JWT_TTL

const normalizePort = (val) => {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    return val
  }

  if (port >= 0) {
    return port
  }

  return false
}

const generateHash = async (password) => {
  const salt = await bcrypt.genSalt(10)
  const hash = await bcrypt.hash(password, salt)
  return hash
}

const generateAccessToken = ({ id, fullname, email }) => {
  const token = jwt.sign({ id, fullname, email }, SECRET_KEY, {
    expiresIn: JWT_TTL,
  })

  return 'Bearer ' + token
}

const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) reject(err)
      resolve(user)
    })
  })
}

const generateCodeModel = async ({
  prefix = '',
  length = 7,
  separator = '',
  model,
  isNumeric = false,
  isUpper = false,
  isLower = false,
}) => {
  const modelRepository = new Repository(model)

  let code = ''
  code = randomString({ length, isNumeric, isUpper, isLower })
  code = prefix + separator + code

  const exist = await modelRepository.findOne({ code })

  if (exist) {
    code = generateCodeModel({
      prefix: prefix,
      length: length,
      separator: separator,
      model: model,
    })
  }

  return code
}

const randomString = ({
  length = 9,
  isNumeric = false,
  isUpper = false,
  isLower = false,
}) => {
  const number = '0123456789'
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lower = 'abcdefghijklmnopqrstuvwxyz'

  var characters = ''
  if (isUpper) {
    characters = characters + upper
  }
  if (isLower) {
    characters = characters + lower
  }
  if (isNumeric) {
    characters = characters + number
  }

  return generateRandomCode(characters, length)
}

const generateRandomCode = (char, length) => {
  let result = ''

  let i = 0
  while (i < length) {
    result += char.charAt(Math.floor(Math.random() * char.length))
    i++
  }

  return result
}

const removeSpecialCharacter = (str) => {
  return str ? String(str).replace(/[\W_]/g, '').toLowerCase() : null
}

module.exports = {
  normalizePort,
  generateHash,
  verifyAccessToken,
  generateAccessToken,
  generateRandomCode,
  generateCodeModel,
  removeSpecialCharacter,
}
