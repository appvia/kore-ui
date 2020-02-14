module.exports = (openIdClient) => {
  return async (req, res, next) => {
    req.strategyName = openIdClient.strategyName
    if (openIdClient.initialised) {
      return next()
    }
    try {
      await openIdClient.setupAuthClient()
      next()
    } catch (err) {
      next(err)
    }
  }
}
