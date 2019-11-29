const Router = require('express').Router

function createTeam(orgService) {
  return async (req, res) => {
    try {
      await orgService.createTeamWithFirstMember(req.body, req.session.passport.user.username)
      res.send()
    } catch (err) {
      res.status(500).send()
    }
  }
}

function initRouter({ ensureAuthenticated, orgService }) {
  const router = Router()
  router.post('/teams', ensureAuthenticated, createTeam(orgService))
  return router
}

module.exports = {
  initRouter
}
