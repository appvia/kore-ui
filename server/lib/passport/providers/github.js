const passport = require('passport')
const { Strategy } = require('passport-github')

module.exports = function(config) {
  passport.use(new Strategy(config, function(accessToken, refreshToken, profile, cb) {
      // In this example, the user's GitHub profile is supplied as the user
      // record.  In a production-quality application, the Facebook profile should
      // be associated with a user record in the application's database, which
      // allows for account linking and authentication with other identity
      // providers.
      console.log('passport', accessToken, refreshToken)
      return cb(null, profile);
    }
  ));
}