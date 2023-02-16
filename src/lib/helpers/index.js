const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Repository = require('../mongodb-repo')
const config = require('../../config')

const SECRET_KEY = config.SECRET_KEY
const JWT_TTL = config.JWT_TTL

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

const generateEmployeeEmail = (fullname, employeeID) => {
  fullname = fullname.toLowerCase()

  const splitted = fullname.split(' ')
  const firstname = splitted[0]
  const lastname = splitted[splitted.length - 1]

  const username =
    splitted.length > 1
      ? firstname + '.' + lastname + employeeID
      : firstname + employeeID

  const domain = '@mail.com'

  return username + domain
}

const paginator = (items, current_page, per_page_items) => {
  let _page = parseInt(current_page, 10)
  let _limit = parseInt(per_page_items, 10)

  _page = Number.isNaN(_page) ? 1 : _page
  _limit = Number.isNaN(_limit) ? config.DEFAULT_LIMIT_LIST : _limit

  _limit = Math.min(_limit, config.MAX_LIMIT_LIST)

  const _skip = _page * _limit - _limit

  let list = items
  if (_page > 0 && _limit > 0) {
    list = items.slice(_skip).slice(0, _limit)
  }

  const next = _skip + _limit < items.length
  const prev = _skip - _limit >= 0

  return {
    pagination: {
      count: items.length,
      next,
      prev,
      page: _page,
      perPage: _limit,
    },
    list,
  }
}

module.exports = {
  normalizePort,
  generateHash,
  verifyAccessToken,
  generateAccessToken,
  generateRandomCode,
  generateCodeModel,
  removeSpecialCharacter,
  generateEmployeeEmail,
  paginator,
}
