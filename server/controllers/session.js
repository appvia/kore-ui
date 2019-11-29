const Router = require('express').Router

function getSessionUser(req, res) {
  return res.json(req.session.passport.user)
}

function initRouter({ ensureAuthenticated }) {
  const router = Router()
  router.get('/session/user', ensureAuthenticated, getSessionUser)
  return router
}

module.exports = {
  initRouter
}
