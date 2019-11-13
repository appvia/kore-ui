const Router = require('express').Router
const app = require('./next')
const { hubApi } = require('../config')
const axios = require('axios').default;

const passport = require('passport')
const router = Router()

router.get('/auth', async (req, res) => {
  const url = `${hubApi.url}/auth`
  try {
    const result = await axios.get(url)
    console.log('result', result.data);
  } catch (err) {
    throw new Error(err.message)
  }

  return app.render(req, res, '/about', req.query)
})

router.get('/user', (req, res) => {
  console.log('/user req.sessionID', req.sessionID)
  console.log('/user req.isAuthenticated()', req.isAuthenticated())
  const user = req.session.passport && req.session.passport.user
  console.log('/user user', user)
  res.json(user || {})
})

router.get('/login/github', passport.authenticate('github'));

router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  console.log('/login/github/callback req.sessionID', req.sessionID)
  res.redirect('/')
})

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if(err) return next(err)
    req.logout()
    res.redirect('/login')
  })
})

module.exports = router
