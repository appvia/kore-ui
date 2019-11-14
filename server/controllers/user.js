const Router = require('express').Router

function getSessionUser() {
  return (req, res) => {
    const user = (req.session.passport && req.session.passport.user) || {}
    res.json(user)
  }
}

function initRouter() {
  const router = Router()
  router.get('/user', getSessionUser())
  return router
}

module.exports = {
  initRouter
}
