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
  return async (req, res) => {
    const username = req.body.login
    const password = req.body.password

    try {
      const user = await authService.authenticateLocalUser({ username, password })
      return req.logIn(user, err => {
        if (err) {
          console.error('Error trying to login user', err)
          return res.status(500).send()
        }
        req.session.save(err => {
          if (err) {
            console.error('Error trying to save session after user login', err)
            return res.status(500).send()
          }
          return res.json(user)
        })
      })
    } catch (err) {
      return res.status(err.status).send()
    }
  }
}

function getAuthCallback(orgService, authService, koreConfig) {
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
        const gkeCredentials = await orgService.getTeamGkeCredentials(koreConfig.koreAdminTeamName, user.username)
        if (gkeCredentials.items.length === 0) {
          redirectPath = '/setup/kore'
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

function initRouter({ authService, orgService, koreConfig, openIdClient, ensureAuthenticated }) {
  const router = Router()
  router.get('/login', ensureOpenIdClientInitialised(openIdClient), getLogin(authService))
  router.get('/login/auth', ensureOpenIdClientInitialised(openIdClient), (req, res) => passport.authenticate(req.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', ensureOpenIdClientInitialised(openIdClient), (req, res, next) => passport.authenticate(req.strategyName, { failureRedirect: '/login' })(req, res, next), getAuthCallback(orgService, authService, koreConfig))
  router.get('/logout', getLogout())
  // for configuring auth provider
  router.post('/login/auth/configure', ensureOpenIdClientInitialised(openIdClient), postLoginAuthConfigure(authService))
  // for local user authentication
  router.post('/login', postLoginLocalUser(authService, getLogin(authService)))
  // this auth route is authenticated, it's called once the local user is verified
  router.get('/login/process', ensureAuthenticated, getAuthCallback(orgService, authService, koreConfig))
  return router
}

module.exports = {
  initRouter
}
