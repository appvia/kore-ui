const axios = require('axios')
const Router = require('express').Router

const PATH_BLACKLIST = ['/auth']

function apiProxy(hubApi) {
  return async (req, res) => {
    const method = req.method.toLowerCase()
    const apiUrlPath = req.originalUrl.replace('/apiproxy', '')
    try {
      const result = await axios[method](`${hubApi.url}${apiUrlPath}`, req.body)
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
  router.use('/apiproxy/*', ensureAuthenticated, checkBlacklist, apiProxy(hubApi))
  return router
}

module.exports = {
  initRouter
}
