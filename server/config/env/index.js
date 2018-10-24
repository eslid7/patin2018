'use strict'

const env = process.env.NODE_ENV || 'development'
const config = require(`./${env}`) // eslint-disable-line import/no-dynamic-require

const defaults = {
  port: process.env.PORT || 5050,
}

module.exports = Object.assign(defaults, config)
