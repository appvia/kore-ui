const Router = require('express').Router
const app = require('./next')
const { hubApi } = require('../config')
const axios = require('axios').default

const passport = require('passport')
const router = Router()

router.get('/login', async (req, res, next) => {
  try {
    const result = await axios.get(`${hubApi.url}/auth`)
    const providers = result.data

    const configured = providers.filter(p => p.config)
    if (configured.length) {

      const { Strategy } = require(`passport-${configured[0].id}`)
      passport.use(new Strategy(configured[0].config,
        function(accessToken, refreshToken, profile, cb) {
          // In this example, the user's Facebook profile is supplied as the user
          // record.  In a production-quality application, the Facebook profile should
          // be associated with a user record in the application's database, which
          // allows for account linking and authentication with other identity
          // providers.
          console.log('passport', accessToken, refreshToken)
          return cb(null, profile);
        }
      ));

      req.configuredProviders = configured.map(p => ({ id: p.id, displayName: p.displayName }))
      return app.render(req, res, '/login', req.query)
    }
    return res.redirect('/no-auth')
  } catch (err) {
    console.error('Error getting auth from API', err)
    return next(err)
  }
})

router.get('/user', (req, res) => {
  const user = (req.session.passport && req.session.passport.user) || {}
  res.json(user)
})

router.get('/login/github', passport.authenticate('github'));

router.get('/login/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
  req.session.save(function(){
    res.redirect('/')
  })
})

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err){
      return next(err)
    }
    res.clearCookie('connect.sid')
    req.logout()
    res.redirect('/login')
  })
})

module.exports = router
