'use strict'

const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const config = require('./env')
const mongoose = require('mongoose')
const passport = require('passport')
const passportStatregy = require('./strategies/passport')
const passportConfig = require('./passport')
const routes = require('../routes')


module.exports.initPassport = function initPassport(app) {
  app.use(
    session({
      secret: 'b33d00',
      resave: false,
      saveUninitialized: false,
    })
  )
  app.use(passport.initialize())
  app.use(passport.session())
  passport.use('passport-local', passportStatregy)
  passport.serializeUser(passportConfig.serializeUser)
  passport.deserializeUser(passportConfig.deserializeUser)
}

module.exports.initRoutes = function initRoutes(app) {
  app.use('/', routes)
}

module.exports.initDB = function initDB() {
  mongoose.Promise = global.Promise
  mongoose.connect(config.mongoURL, {
    socketTimeoutMS: 0,
    keepAlive: true,
    reconnectTries: 30,
    useNewUrlParser: true
  })
  mongoose.connection.on('error', err => {
    console.error(`Unable to connect to database: ${config.mongoURL}`)
    console.error('Por favor verificar que Mongodb esta instalado y corriendo!')
    throw err
  })
}

module.exports.initMiddlewares = function initMiddlewares(app) {
  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(
    bodyParser.urlencoded({
       limit: '50mb',
       extended: true,
       parameterLimit: 50000,
    })
  )
}

module.exports.initViewsEngine = function initViewsEngine(app) {
  app.set('view engine', 'ejs')
  app.set('views', './server/views')
  app.use('/static',express.static('./server/public'))
}

module.exports.init = () => {
  const app = express()
  this.initMiddlewares(app)
  this.initDB()
  this.initPassport(app)
  this.initRoutes(app)
  this.initViewsEngine(app)
  app
    .listen(config.port, () => {
      console.log(
        'App listening on port %s, in environment %s!',
        config.port,
        process.env.NODE_ENV || 'develop'
      )
      console.log('**********************')
      console.log('patim-server online')
      console.log('**********************')
    })
    .on('error', err => {
      console.error(err)
    })
  return app
}
