const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')
const OrgService = require('./services/org')
const ensureAuthenticated = require('./middleware/ensure-authenticated')

const authService = new AuthService(config.hubApi, config.hub.baseUrl)
const orgService = new OrgService(config.hubApi)

// auth routes are unrestricted
router.use(require('./controllers/auth').initRouter({ authService, orgService, hubConfig: config.hub }))

// other routes must have an authenticated user
router.use(require('./controllers/session').initRouter({ ensureAuthenticated, orgService }))
router.use(require('./controllers/apiproxy').initRouter({ ensureAuthenticated, hubApi: config.hubApi }))

module.exports = router
