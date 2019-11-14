const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')

const authService = new AuthService(config.hubApi)

router.use(require('./controllers/user').initRouter())
router.use(require('./controllers/auth').initRouter({ authService }))

module.exports = router
