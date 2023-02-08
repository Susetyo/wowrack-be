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
 * Get PORT from environment and store in Express.
 */

const PORT = normalizePort(config.PORT || '3000')

app.set('port', PORT)
app.set('trust proxy', true)

/**
 * Create HTTP server.
 */

const server = http.createServer(app)

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(PORT, config.HOST, () => {
  console.log(`Server listening at http://${config.HOST}:${config.PORT}`)

  // connect to database
  createConnection(config.MONGODB_URI)
})
