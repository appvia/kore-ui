module.exports = (req, res, next) => {
  const requestedPath = req.query.requestedPath
  if (requestedPath) {
    req.session.requestedPath = requestedPath
  }
  next()
}
