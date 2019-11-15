const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')
const UserService = require('./services/user')

const authService = new AuthService(config.hubApi)
const userService = new UserService(config.hubApi)

router.use(require('./controllers/user').initRouter())
router.use(require('./controllers/auth').initRouter({ authService, userService }))

module.exports = router
