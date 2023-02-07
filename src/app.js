const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const routes = require('@/route')
const errorHandler = require('@/middleware/error-handler')
const preSerialization = require('@/middleware/pre-serialization')

const app = express()

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static('public')) // expose ./public/* folder

// serialize response
app.use(preSerialization)

// register routes
app.use(routes)

// custom error handler
app.use(errorHandler)

module.exports = app
