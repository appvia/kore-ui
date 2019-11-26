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
      require('../lib/passport')(authProvider.id)(authProvider.config)
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

function getLoginGithubCallback(userService, classService) {
  return async (req, res) => {
    const username = req.session.passport.user.username
    const userInfo = await userService.getOrCreateUser(username)
    req.session.passport.user.teams = userInfo.teams || []
    req.session.passport.user.isAdmin = userService.isAdmin(userInfo)
    let redirectPath = '/'
    if (req.session.passport.user.isAdmin) {
      const gkeBinding = await classService.getTeamBindingByName('hub-admin', 'gke')
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

function initRouter({ authService, userService, classService }) {
  const router = Router()
  router.get('/login', getLogin(authService))
  router.get('/logout', getLogout())
  router.get('/login/github', passport.authenticate('github'))
  router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), getLoginGithubCallback(userService, classService))
  router.post('/auth/configure', postConfigureAuthProvider(authService))
  return router
}

module.exports = {
  initRouter
}
