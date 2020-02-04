const Router = require('express').Router
const passport = require('passport')
const app = require('../next')

function ensureOpenIdClientInitialised(openIdClient) {
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

function getLogin(authService) {
  return async (req, res, next) => {
    try {
      const authProvider = await authService.getDefaultConfiguredIdp()
      /* eslint-disable-next-line require-atomic-updates */
      req.authProvider = authProvider
      req.session.save(async () => {
        return app.render(req, res, '/login', req.query)
      })
    } catch (err) {
      return next(err)
    }
  }
}

function postLoginLocalUser(authService) {
  return async (req, res, next) => {
    const username = req.body.login
    const password = req.body.password

    try {
      const user = await authService.authenticateLocalUser({ username, password })
      return req.logIn(user, (err) => {
        if (err) {
          return next(err)
        }
        req.override = true
        req.session.save(next)
      })
    } catch (err) {
      req.localLoginError = err.code || 'SERVER_ERROR'
      return getLogin(authService)(req, res, next)
    }
  }
}

function getAuthCallback(orgService, authService, hubConfig) {
  return async (req, res) => {
    const user = req.session.passport.user
    if (!user.username) {
      user.username = user.preferred_username || user.email.substr(0, user.email.indexOf('@'))
    }
    const userInfo = await orgService.getOrCreateUser(user)
    /* eslint-disable require-atomic-updates */
    user.teams = userInfo.teams || []
    user.isAdmin = userInfo.isAdmin
    /* eslint-enable require-atomic-updates */
    let redirectPath = '/'
    if (user.isAdmin) {
      const authProvider = await authService.getDefaultConfiguredIdp()
      if (!authProvider) {
        redirectPath = '/setup/authentication'
      } else {
        // this is hard-coded to check for GKE credentials, but this will need to be more flexible in the future
        const gkeCredentials = await orgService.getTeamGkeCredentials(hubConfig.hubAdminTeamName, user.username)
        if (gkeCredentials.items.length === 0) {
          redirectPath = '/setup/hub'
        }
      }
    }
    req.session.save(function() {
      res.redirect(redirectPath)
    })
  }
}

function getLogout() {
  return (req, res, next) => {
    req.session.destroy((err) => {
      if (err){
        return next(err)
      }
      res.clearCookie('connect.sid')
      req.logout()
      res.redirect('/login')
    })
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

function initRouter({ authService, orgService, hubConfig, openIdClient }) {
  const router = Router()
  router.get('/login', ensureOpenIdClientInitialised(openIdClient), getLogin(authService))
  router.get('/login/auth', ensureOpenIdClientInitialised(openIdClient), (req, res) => passport.authenticate(req.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', ensureOpenIdClientInitialised(openIdClient), (req, res, next) => passport.authenticate(req.strategyName, { failureRedirect: '/login' })(req, res, next), getAuthCallback(orgService, authService, hubConfig))
  router.post('/login/auth/configure', ensureOpenIdClientInitialised(openIdClient), postLoginAuthConfigure(authService))
  router.get('/logout', getLogout())
  router.post('/login', postLoginLocalUser(authService, getLogin(authService)), getAuthCallback(orgService, authService, hubConfig))
  return router
}

module.exports = {
  initRouter
}
