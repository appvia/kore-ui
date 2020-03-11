const axios = require('axios')
const Router = require('express').Router

function processTeamInvitation(koreApi) {
  return async (req, res, next) => {
    const token = req.params.token
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session.passport.user.id_token}`
      }
    }
    try {
      const invitationResponse = await axios.put(`${koreApi.url}/teams/invitation/${token}`, undefined, options)
      let redirectTo = '/'
      if (invitationResponse.data.team) {
        redirectTo = `/teams/${invitationResponse.data.team}?invitation=true`
      }
      return res.redirect(redirectTo)
    } catch (err) {
      const status = (err.response && err.response.status) || 500
      const message = (err.response && err.response.data && err.response.data.message) || err.message
      console.error(`Error processing team invitation link with token ${token}`, status, message, err)
      return next(err)
    }
  }
}

function persistPath(req, res, next) {
  req.session.requestedPath = req.path
  next()
}

function initRouter({ ensureAuthenticated, ensureUserCurrent, koreApi }) {
  const router = Router()
  router.get('/process/teams/invitation/:token', persistPath, ensureAuthenticated, ensureUserCurrent, processTeamInvitation(koreApi))
  return router
}

module.exports = {
  initRouter
}
