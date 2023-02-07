#!/usr/bin/env node

/**
 * Module dependencies.
 */

const http = require('http')
require('dotenv').config()
require('module-alias/register')

const app = require('./app')

const { createConnection } = require('./infrastructure/mongodb')
const { normalizePort } = require('./lib/helpers')
const config = require('./config')

/**
 * Get PORT and APP_URL from environment and store in Express.
 */

const PORT = normalizePort(config.PORT || '3000')
const APP_URL = config.APP_URL

app.set('port', PORT)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(PORT, () => {
  console.log(`Application running on ${APP_URL}:${PORT}`)

  // connect to database
  createConnection(config.MONGODB_URI)
})
