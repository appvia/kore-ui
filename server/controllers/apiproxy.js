const axios = require('axios')
const Router = require('express').Router

const PATH_BLACKLIST = ['/auth']

function apiProxyGet(hubApi) {
  return async (req, res) => {
    const apiUrlPath = req.originalUrl.replace('/apiproxy', '')
    try {
      const result = await axios.get(`${hubApi.url}${apiUrlPath}`)
      return res.json(result.data)
    } catch (err) {
      const status = (err.response && err.response.status) || 500
      console.error(`Error making request to API with path ${apiUrlPath}`, status, err.message)
      return res.status(status).send()
    }
  }
}

function checkBlacklist(req, res, next) {
  const apiUrlPath = req.originalUrl.replace('/apiproxy', '')
  if (PATH_BLACKLIST.includes(apiUrlPath)) {
    return res.status(404).send()
  }
  next()
}

function initRouter({ ensureAuthenticated, hubApi }) {
  const router = Router()
  router.get('/apiproxy/*', ensureAuthenticated, checkBlacklist, apiProxyGet(hubApi))
  return router
}

module.exports = {
  initRouter
}
