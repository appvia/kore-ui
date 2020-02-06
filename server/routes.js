const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')
const OrgService = require('./services/org')
const OpenIdClient = require('./lib/openid-client')
const ensureAuthenticated = require('./middleware/ensure-authenticated')

const authService = new AuthService(config.koreApi, config.kore.baseUrl)
const orgService = new OrgService(config.koreApi)
const openIdClient = new OpenIdClient(config.kore.baseUrl, config.auth.url, config.auth.clientId, config.auth.clientSecret, authService)

openIdClient.init()
  .then(() => {
    // auth routes are unrestricted
    router.use(require('./controllers/auth').initRouter({ authService, orgService, koreConfig: config.kore, openIdClient, ensureAuthenticated }))

    // other routes must have an authenticated user
    router.use(require('./controllers/session').initRouter({ ensureAuthenticated, orgService }))
    router.use(require('./controllers/apiproxy').initRouter({ ensureAuthenticated, koreApi: config.koreApi }))
  })
  .catch(err => {
    console.error('Unexpected error occurred during openIdClient initialisation', err)
  })

module.exports = router
