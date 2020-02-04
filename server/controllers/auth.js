const Router = require('express').Router
const passport = require('passport')
const app = require('../next')

// this is a temporary patch to login users without properly authenticating
passport.serializeUser(function(user, cb) {
  cb(null, user)
})
passport.deserializeUser(function(obj, cb) {
  cb(null, obj)
})

function ensureOpenIdClientInitialised(openIdClient) {
  return async (req, res, next) => {
    // this is a temporary patch to login users without properly authenticating
    if (req.query.override === 'true') {
      return next()
    }
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

function getLogin(openIdClient, authService) {
  return async (req, res, next) => {
    if (req.query.override === 'true') {
      return app.render(req, res, '/login', req.query)
    }
    try {
      const { authUrl, nonce } = openIdClient.localUserAuth()
      const localAuthUrl = await authService.generateLocalAuthPostUrl(authUrl)
      const authProvider = await authService.getDefaultConfiguredIdp()
      /* eslint-disable require-atomic-updates */
      req.authProvider = authProvider
      req.localAuthUrl = localAuthUrl
      req.session.nonce = nonce
      /* eslint-disable require-atomic-updates */
      req.session.save(async () => {
        return app.render(req, res, '/login', req.query)
      })
    } catch (err) {
      return next(err)
    }
  }
}

// this is a temporary function to login users without properly authenticating
function postLoginOverride() {
  return async (req, res, next) => {
    const user = req.body
    req.logIn(user, (err) => {
      if (err) {
        return next(err)
      }
      req.override = true
      req.session.save(next)
    })
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
    const userInfo = await orgService.getOrCreateUser(user)
    /* eslint-disable require-atomic-updates */
    user.teams = userInfo.teams || []
    user.isAdmin = userInfo.isAdmin
    /* eslint-enable require-atomic-updates */
    let redirectPath = '/'
    if (user.isAdmin) {
      // TODO: uncomment when we are able to use Auth again
      // const authProvider = await authService.getDefaultConfiguredIdp()
      // if (!authProvider) {
      //   redirectPath = '/setup/authentication'
      // } else {
      // this is hard-coded to check for GKE credentials, but this will need to be more flexible in the future
      const gkeCredentials = await orgService.getTeamGkeCredentials(hubConfig.hubAdminTeamName, user.username)
      if (gkeCredentials.items.length === 0) {
        redirectPath = '/setup/hub'
      }
      // }
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
  router.get('/login/auth', ensureOpenIdClientInitialised(openIdClient), (req, res) => passport.authenticate(req.strategyName, { connector_id: req.query.provider })(req, res))
  router.get('/auth/callback', ensureOpenIdClientInitialised(openIdClient), (req, res, next) => passport.authenticate(req.strategyName, { failureRedirect: '/login' })(req, res, next), getAuthCallback(orgService, authService, hubConfig))
  router.get('/auth/local/callback', ensureOpenIdClientInitialised(openIdClient), handleAuthLocalCallback(openIdClient), getAuthCallback(orgService, authService, hubConfig))
  router.post('/login/auth/configure', ensureOpenIdClientInitialised(openIdClient), postLoginAuthConfigure(authService))
  router.get('/logout', getLogout())

  // this is a temporary route to login users without properly authenticating
  router.post('/login', postLoginOverride(), getAuthCallback(orgService, authService, hubConfig))
  return router
}

module.exports = {
  initRouter
}
