const express = require('express')
const passport = require('passport')
const { Strategy } = require('passport-github')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const app = require('./next')
const { server } = require('../config')
const router = require('./routes')

const port = server.port

passport.use(new Strategy({
    clientID: '148f318b091305adc9da',
    clientSecret: 'f51bf87408e07292ab52393f81d0cef84ac3884a',
    callbackURL: '/login/github/callback'
  },
  function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's Facebook profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    console.log('passport', accessToken, refreshToken)
    return cb(null, profile);
  }
));

// Configure Passport authenticated session persistence.
//
// In order to restore authentication state across HTTP requests, Passport needs
// to serialize users into and deserialize users out of the session.  In a
// production-quality application, this would typically be as simple as
// supplying the user ID when serializing, and querying the user record by ID
// from the database when deserializing.  However, due to the fact that this
// example does not have a database, the complete Facebook profile is serialized
// and deserialized.
passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.prepare().then(() => {
  const server = express()

  server.use(cookieParser())
  server.use(session({
    secret: 'supersecret',
    resave: true,
    saveUninitialized: true
  }));

  server.use(passport.initialize())
  server.use(passport.session())

  server.use(router)

  server.all('*', (req, res) => {
    const handle = app.getRequestHandler()
    return handle(req, res)
  })

  server.listen(port, err => {
    if (err) {
      throw err
    }
    console.log(`> Ready on http://localhost:${port}`)
  })
})
