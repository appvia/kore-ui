const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')
const OrgService = require('./services/org')
const OpenIdClient = require('./lib/openid-client')
const ensureAuthenticated = require('./middleware/ensure-authenticated')
const ensureUserCurrent = require('./middleware/ensure-user-current')

const koreConfig = config.kore
const koreApi = config.koreApi
const embeddedAuth = config.auth.embedded
const userClaimsOrder = config.auth.openid.userClaimsOrder.split(',')

const authService = new AuthService(config.koreApi, config.kore.baseUrl)
const orgService = new OrgService(config.koreApi)
const authCallback = require('./middleware/auth-callback')(orgService, authService, koreConfig, userClaimsOrder, embeddedAuth)

const openIdClient = new OpenIdClient(config.kore.baseUrl, config.auth.openid, embeddedAuth, authService)
openIdClient.init()
  .then(() => {})
  .catch(err => {
    console.error('Unexpected error occurred during openIdClient initialisation', err)
  })
const ensureOpenIdClient = require('./middleware/ensure-openid-client')(openIdClient)
router.use(require('./controllers/auth-local').initRouter({ authService, ensureAuthenticated, authCallback }))
router.use(require('./controllers/auth-openid').initRouter({ authService, ensureOpenIdClient, embeddedAuth, authCallback }))

// other routes must have an authenticated user
router.use(require('./controllers/session').initRouter({ ensureAuthenticated, ensureUserCurrent, orgService }))
router.use(require('./controllers/apiproxy').initRouter({ ensureAuthenticated, ensureUserCurrent, koreApi }))

module.exports = router
