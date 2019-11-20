const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')
const UserService = require('./services/user')
const ClassService = require('./services/class')

const authService = new AuthService(config.hubApi)
const userService = new UserService(config.hubApi)
const classService = new ClassService(config.hubApi)

router.use(require('./controllers/user').initRouter())
router.use(require('./controllers/auth').initRouter({ authService, userService }))
router.use(require('./controllers/class').initRouter({ classService }))

module.exports = router
