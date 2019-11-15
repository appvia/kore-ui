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

function getLoginGithubCallback(userService) {
  return async (req, res) => {
    const email = req.session.passport.user.emails[0].value
    const userInfo = await userService.getUserInfo(email)
    const teams = userInfo.teams || []
    req.session.passport.user.teams = teams
    req.session.passport.user.isAdmin = Boolean(teams.filter(t => t.slug === 'hub-admins').length)
    req.session.save(function() {
      res.redirect('/')
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

function initRouter({ authService, userService }) {
  const router = Router()
  router.get('/login', getLogin(authService))
  router.get('/logout', getLogout())
  router.get('/login/github', passport.authenticate('github'))
  router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), getLoginGithubCallback(userService))
  router.post('/auth/configure', postConfigureAuthProvider(authService))
  return router
}

module.exports = {
  initRouter
}
