const Router = require('express').Router
const passport = require('passport')
const app = require('../next')

function getLogin(authService, embeddedAuth) {
  return async (req, res, next) => {
    try {
      if (embeddedAuth) {
        const authProvider = await authService.getDefaultConfiguredIdp()
        /* eslint-disable-next-line require-atomic-updates */
        req.authProvider = authProvider
      }
      req.embeddedAuth = embeddedAuth
      return app.render(req, res, '/login', req.query)
    } catch (err) {
      return next(err)
    }
  }
}

function postLoginAuthConfigure(authService) {
  return async (req, res) => {
    try {
      await authService.setDefaultConfiguredIdp(req.body.name, req.body.displayName, req.body.config)
      res.send()
    } catch (err) {
      res.status(500).send()
    }
  }
}

function initRouter({ authService, ensureOpenIdClient, embeddedAuth, authCallback }) {
  const router = Router()
  router.get('/login', ensureOpenIdClient, getLogin(authService, embeddedAuth))
  router.get('/login/auth', ensureOpenIdClient, (req, res) => passport.authenticate(req.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', ensureOpenIdClient, (req, res, next) => passport.authenticate(req.strategyName, { failureRedirect: '/login' })(req, res, next), authCallback)
  // for configuring auth provider
  router.post('/login/auth/configure', ensureOpenIdClient, postLoginAuthConfigure(authService))
  return router
}

module.exports = {
  initRouter
}
