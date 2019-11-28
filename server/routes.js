const axios = require('axios')
const Router = require('express').Router
const router = Router()
const config = require('../config')
const AuthService = require('./services/auth')
const UserService = require('./services/user')
const ClassService = require('./services/class')

const authService = new AuthService(config.hubApi, config.hub.baseUrl)
const userService = new UserService(config.hubApi)
const classService = new ClassService(config.hubApi)
const hubConfig = config.hub

router.use(require('./controllers/auth').initRouter({ authService, userService, classService, hubConfig }))
router.use(require('./controllers/user').initRouter())
router.use(require('./controllers/team').initRouter({ userService }))
router.use(require('./controllers/class').initRouter({ classService }))

router.get('/apiproxy/*', async(req, res) => {
  const apiUrlPath = req.originalUrl.replace('/apiproxy', '')
  try {
    const result = await axios.get(`${config.hubApi.url}${apiUrlPath}`)
    return res.json(result.data)
  } catch (err) {
    console.log('error', err)
    return res.status(err.response.status).send()
  }
})

module.exports = router
