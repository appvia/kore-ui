const passport = require('passport')
const { Strategy } = require('passport-github')

module.exports = function(config) {
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
    cb(null, user)
  })

  passport.deserializeUser(function(obj, cb) {
    cb(null, obj)
  })

  passport.use(new Strategy(config, function(accessToken, refreshToken, profile, cb) {
    // In this example, the user's GitHub profile is supplied as the user
    // record.  In a production-quality application, the Facebook profile should
    // be associated with a user record in the application's database, which
    // allows for account linking and authentication with other identity
    // providers.
    console.log('passport', accessToken, refreshToken)
    return cb(null, profile)
  }))
}
