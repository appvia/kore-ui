const Router = require('express').Router

function createTeam(userService) {
  return async (req, res) => {
    try {
      await userService.createTeam(req.body, req.session.passport.user.username)
      res.send()
    } catch (err) {
      res.status(500).send()
    }
  }
}

function initRouter({ userService }) {
  const router = Router()
  router.post('/teams', createTeam(userService))
  return router
}

module.exports = {
  initRouter
}
