const joi = require('joi')

const email = joi.string().email()
const password = joi.string().min(8).max(255)
const objectId = joi.string().min(24).max(24)
const slug = joi.string()
const numericString = joi.string().length(7).pattern(/^\d+$/).messages({
  'string.pattern.base': 'divisionID should be a number',
})

module.exports = {
  email,
  password,
  objectId,
  slug,
  numericString,
}
