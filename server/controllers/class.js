const Router = require('express').Router

function getClasses(classService) {
  return async (req, res) => {
    try {
      const classes = await classService.getClasses({ category: req.query.category })
      res.json(classes)
    } catch (e) {
      res.status(500).send()
    }
  }
}

function postClasses(classService) {
  return async (req, res) => {
    const kind = req.body.kind
    const resource = require(`../models/${kind}`)(req.body.spec)
    try {
      const classResult = await classService.putTeamClass({
        team: req.body.team,
        className: req.body.className,
        resource
      })
      res.json(classResult)
    } catch (e) {
      res.status(500).send()
    }
  }
}


function initRouter({ ensureAuthenticated, classService }) {
  const router = Router()
  router.get('/classes', ensureAuthenticated, getClasses(classService))
  router.post('/classes', ensureAuthenticated, postClasses(classService))
  return router
}

module.exports = {
  initRouter
}
