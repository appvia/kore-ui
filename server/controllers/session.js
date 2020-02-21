const Router = require('express').Router

function getSessionUser(orgService) {
  return async(req, res) => {
    const requestedPath = req.query.requestedPath
    if (requestedPath) {
      req.session.requestedPath = requestedPath
    }

    const user = req.session.passport.user
    await orgService.refreshUser(user)
    return res.json(user)
  }
}

function initRouter({ ensureAuthenticated, ensureUserCurrent, orgService }) {
  const router = Router()
  router.get('/session/user', ensureAuthenticated, ensureUserCurrent, getSessionUser(orgService))
  return router
}

module.exports = {
  initRouter
}
