const Router = require('express').Router
const passport = require('passport')
const app = require('../next')

function ensureOpenIdClientInitialised(openIdClient) {
  return async (req, res, next) => {
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

function getLogin(openIdClient, authService) {
  return async (req, res, next) => {
    try {
      const { authUrl, nonce } = openIdClient.localUserAuth()
      const localAuthUrl = await authService.generateLocalAuthPostUrl(authUrl)
      const authProvider = await authService.getDefaultConfiguredIdp()
      req.authProvider = authProvider
      req.localAuthUrl = localAuthUrl
      req.session.nonce = nonce
      req.session.save(async () => {
        return app.render(req, res, '/login', req.query)
      })
    } catch (err) {
      return next(err)
    }
  }
}

function handleAuthLocalCallback(openIdClient) {
  return async (req, res, next) => {
    const nonce = req.session.nonce
    delete req.session.nonce
    try {
      const claims = await openIdClient.localUserAuthCallback(req, nonce)
      req.logIn(claims, (err) => {
        if (err) {
          return next(err)
        }
        req.session.save(next)
      })
    } catch (err) {
      console.error('Error handling local auth callback, redirecting back to login', err)
      res.redirect('/login')
    }
  }
}

function getAuthCallback(orgService, authService, hubConfig) {
  return async (req, res) => {
    const user = req.session.passport.user
    user.username = user.preferred_username || user.email.substr(0, user.email.indexOf('@'))
    orgService.setXIdentityHeader(user.username)
    const userInfo = await orgService.getOrCreateUser(user.username)
    /* eslint-disable require-atomic-updates */
    req.session.passport.user.teams = userInfo.teams || []
    req.session.passport.user.isAdmin = orgService.isAdmin(userInfo)
    /* eslint-enable require-atomic-updates */
    let redirectPath = '/'
    if (req.session.passport.user.isAdmin) {
      const authProvider = await authService.getDefaultConfiguredIdp()
      if (!authProvider) {
        redirectPath = '/setup/authentication'
      } else {
        // this is hard-coded to check for GKE binding, but this will need to be more flexible in the future
        const bindings = await orgService.getTeamBindings(hubConfig.hubAdminTeamName)
        const gkeClassBindings = bindings.items.filter(binding => binding.spec.class.kind === 'Class' && binding.spec.class.name === 'gke')
        if (gkeClassBindings.length === 0) {
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
  router.get('/login', ensureOpenIdClientInitialised(openIdClient), getLogin(openIdClient, authService))
  router.get('/login/auth', ensureOpenIdClientInitialised(openIdClient), (req, res) => passport.authenticate(openIdClient.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', ensureOpenIdClientInitialised(openIdClient), passport.authenticate(openIdClient.strategyName, { failureRedirect: '/login' }), getAuthCallback(orgService, authService, hubConfig))
  router.get('/auth/local/callback', ensureOpenIdClientInitialised(openIdClient), handleAuthLocalCallback(openIdClient), getAuthCallback(orgService, authService, hubConfig))
  router.post('/login/auth/configure', ensureOpenIdClientInitialised(openIdClient), postLoginAuthConfigure(authService))
  router.get('/logout', getLogout())
  return router
}

module.exports = {
  initRouter
}
