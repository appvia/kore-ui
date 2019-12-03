const Router = require('express').Router
const passport = require('passport')
const app = require('../next')

function getLogin(authService) {
  return async (req, res, next) => {
    try {
      const authProvider = await authService.getConfiguredAuthProvider()
      if (!authProvider) {
        return res.redirect('/setup/auth')
      }
      const config = {
        clientID: authProvider.spec.clientID,
        clientSecret: authProvider.spec.clientSecret,
        ...authService.providerSpecificConfig(authProvider.metadata.name)
      }
      require('../lib/passport')(authProvider.metadata.name)(config)
      req.authProvider = authProvider
      return app.render(req, res, '/login', req.query)
    } catch (err) {
      return next(err)
    }
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

function getLoginGithubCallback(orgService, hubConfig) {
  return async (req, res) => {
    const username = req.session.passport.user.username
    const userInfo = await orgService.getOrCreateUser(username)
    req.session.passport.user.teams = userInfo.teams || []
    req.session.passport.user.isAdmin = orgService.isAdmin(userInfo)
    let redirectPath = '/'
    if (req.session.passport.user.isAdmin) {
      // this is hard-coded to check for GKE binding, but this will need to be more flexible in the future
      const gkeBinding = await orgService.getTeamBindingByName(hubConfig.hubAdminTeamName, 'gke')
      if (!gkeBinding) {
        redirectPath = '/setup/hub'
      }
    }
    req.session.save(function() {
      res.redirect(redirectPath)
    })
  }
}

function postConfigureAuthProvider(authService) {
  return async (req, res) => {
    try {
      await authService.setConfiguredAuthProvider(req.body)
      res.send()
    } catch (err) {
      res.status(500).send()
    }
  }
}

function initRouter({ authService, orgService, hubConfig }) {
  const router = Router()
  router.get('/login', getLogin(authService))
  router.get('/logout', getLogout())
  router.get('/login/github', passport.authenticate('github'))
  router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), getLoginGithubCallback(orgService, hubConfig))
  router.post('/auth/configure', postConfigureAuthProvider(authService))
  return router
}

module.exports = {
  initRouter
}
