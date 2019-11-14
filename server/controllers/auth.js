const Router = require('express').Router
const passport = require('passport')
const app = require('../next')
const axios = require('axios').default
const { hubApi } = require('../../config')

function getLogin() {
  return async (req, res, next) => {
    try {
      const result = await axios.get(`${hubApi.url}/auth`)
      const providers = result.data

      const configured = providers.filter(p => p.config)
      if (configured.length) {
        const provider = configured[0].id
        const config = configured[0].config
        require('../lib/passport')(provider)(config)

        req.configuredProviders = configured.map(p => ({ id: p.id, displayName: p.displayName }))
        return app.render(req, res, '/login', req.query)
      }
      return res.redirect('/no-auth')
    } catch (err) {
      console.error('Error getting auth from API', err)
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

function getLoginGithubCallback() {
  return (req, res) => {
    req.session.save(function() {
      res.redirect('/')
    })
  }
}

function initRouter() {
  const router = Router()
  router.get('/login', getLogin())
  router.get('/logout', getLogout())
  router.get('/login/github', passport.authenticate('github'))
  router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), getLoginGithubCallback())
  return router
}

module.exports = {
  initRouter
}
