const userExpired = require('../lib/user-expired')

module.exports = (req, res, next) => {
  const session = req.session
  if (userExpired(session.passport.user)) {
    return res.status(401).send()
  }
  next()
}
