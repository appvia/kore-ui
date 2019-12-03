const Router = require('express').Router

function getSessionUser(orgService) {
  return async(req, res) => {
    const user = req.session.passport.user
    await orgService.refreshUser(user)
    return res.json(user)
  }
}

function initRouter({ ensureAuthenticated, orgService }) {
  const router = Router()
  router.get('/session/user', ensureAuthenticated, getSessionUser(orgService))
  return router
}

module.exports = {
  initRouter
}
