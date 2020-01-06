const Router = require('express').Router
const passport = require('passport')
const app = require('../next')

function getLogin(authService) {
  return async (req, res, next) => {
    try {
      const authProvider = await authService.getDefaultConfiguredIdp()
      if (!authProvider) {
        return res.redirect('/setup/authentication')
      }
      req.authProvider = authProvider
      return app.render(req, res, '/login', req.query)
    } catch (err) {
      return next(err)
    }
  }
}

function getAuthCallback(orgService, hubConfig) {
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
      // this is hard-coded to check for GKE binding, but this will need to be more flexible in the future
      const bindings = await orgService.getTeamBindings(hubConfig.hubAdminTeamName)
      const gkeClassBindings = bindings.items.filter(binding => binding.spec.class.kind === 'Class' && binding.spec.class.name === 'gke')
      if (gkeClassBindings.length === 0) {
        redirectPath = '/setup/hub'
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
  router.get('/login', getLogin(authService))
  router.get('/login/auth', (req, res) => passport.authenticate(openIdClient.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', passport.authenticate(openIdClient.strategyName, { failureRedirect: '/login' }), getAuthCallback(orgService, hubConfig))
  router.post('/login/auth/configure', postLoginAuthConfigure(authService))
  router.get('/logout', getLogout())
  return router
}

module.exports = {
  initRouter
}
