const axios = require('axios')
const Router = require('express').Router
const apiPaths = require('../../lib/utils/api-paths')

function processTeamInvitation(koreApi) {
  return async (req, res) => {
    const token = req.params.token
    const options = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${req.session.passport.user.id_token}`
      }
    }
    try {
      const url = koreApi.url + apiPaths.useTeamInvitation(token)
      const invitationResponse = await axios.put(url, undefined, options)
      let redirectTo = '/'
      if (invitationResponse.data.team) {
        redirectTo = `/teams/${invitationResponse.data.team}?invitation=true`
      }
      return res.redirect(redirectTo)
    } catch (err) {
      const status = (err.response && err.response.status) || 500
      const message = (err.response && err.response.data && err.response.data.message) || err.message
      console.error(`Error processing team invitation link with token ${token}`, status, message, err)
      const invitationLink = req.protocol + '://' + req.get('host') + req.originalUrl
      return res.redirect(`/invalid-team-invitation?link=${invitationLink}`)
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
