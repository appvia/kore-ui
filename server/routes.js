const Router = require('express').Router
const router = Router()

router.use(require('./controllers/user').initRouter())
router.use(require('./controllers/auth').initRouter())

module.exports = router
