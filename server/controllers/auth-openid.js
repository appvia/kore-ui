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
      if (req.session.loginError) {
        req.loginError = req.session.loginError
        delete req.session.loginError
      }
      req.embeddedAuth = embeddedAuth
      return app.render(req, res, '/login', req.query)
    } catch (err) {
      return next(err)
    }
  }
}

function getLoginRefresh(req, res) {
  const { localUser, authProvider, passport } = req.session
  if (!passport || localUser) {
    return res.redirect('/login')
  }
  const authUrl = `/login/auth${authProvider ? `?provider=${authProvider}` : ''}`
  return res.redirect(authUrl)
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

function persistProviderUsed(req, res, next) {
  if (!req.query.provider) {
    return next()
  }

  req.session.authProvider = req.query.provider
  req.session.save(err => {
    if (err) {
      return next(err)
    }
    next()
  })
}

function initRouter({ authService, ensureOpenIdClient, persistRequestedPath, embeddedAuth, authCallback }) {
  const router = Router()
  router.get('/login', ensureOpenIdClient, getLogin(authService, embeddedAuth))
  router.get('/login/refresh', ensureOpenIdClient, persistRequestedPath, getLoginRefresh)
  router.get('/login/auth', ensureOpenIdClient, persistProviderUsed, (req, res) => passport.authenticate(req.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', ensureOpenIdClient, (req, res, next) => passport.authenticate(req.strategyName, { failureRedirect: '/login' })(req, res, next), authCallback)
  // for configuring auth provider
  router.post('/login/auth/configure', ensureOpenIdClient, postLoginAuthConfigure(authService))
  return router
}

module.exports = {
  initRouter
}
