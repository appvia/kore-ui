module.exports = ({ redirect }) => {
  return (req, res, next) => {
    if (!req.isAuthenticated || !req.isAuthenticated()) {
      if (redirect) {
        return res.redirect('/login/refresh')
      }
      return res.status(401).send()
    }
    next()
  }
}
