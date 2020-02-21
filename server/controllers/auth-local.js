const Router = require('express').Router

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
        req.session.localUser = true
        req.session.passport.user.id_token = authService.koreApi.token
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

function initRouter({ authService, ensureAuthenticated, authCallback }) {
  const router = Router()
  router.get('/logout', getLogout())
  // for local user authentication
  router.post('/login', postLoginLocalUser(authService))
  // this auth route is authenticated, it's called once the local user is verified
  router.get('/login/process', ensureAuthenticated, authCallback)
  return router
}

module.exports = {
  initRouter
}
