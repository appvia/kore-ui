const axios = require('axios')
const IDPClient = require('../../lib/crd/IDPClient')
const IDP = require('../../lib/crd/IDP')
const copy = require('../../lib/utils/object-copy')
const apiPaths = require('../../lib/utils/api-paths')

class AuthService {
  constructor(koreApi, baseUrl) {
    this.koreApi = koreApi
    this.baseUrl = baseUrl
    this.requestOptions = {
      headers: {
        'Authorization': `Bearer ${koreApi.token}`
      }
    }
  }

  async getDefaultConfiguredIdp() {
    try {
      const result = await axios.get(this.koreApi.url + apiPaths.idp.default, this.requestOptions)
      return result.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null
      }
      console.error('Error getting auth providers from API', err)
      return Promise.reject(err)
    }
  }

  async setAuthClient() {
    try {
      await axios.put(`${this.koreApi.url}${apiPaths.idp.clients}/kore-ui`, IDPClient, this.requestOptions)
      console.log('Auth client created successfully')
    } catch (err) {
      console.error('Error setting auth client from API', err)
      return Promise.reject(err)
    }
  }

  async setDefaultConfiguredIdp(name, displayName, config) {
    try {
      const spec = {
        displayName,
        config: {}
      }
      spec.config[name] = config
      const idp = IDP(spec)
      await axios.put(`${this.koreApi.url}${apiPaths.idp.configured}/default`, idp, this.requestOptions)
    } catch (err) {
      console.error('Error setting configured auth provider from API', err)
      return Promise.reject(err)
    }
  }

  async authenticateLocalUser({ username, password }) {
    try {
      const options = copy(this.requestOptions)
      options.auth = { username, password }
      const result = await axios.get(this.koreApi.url + apiPaths.whoAmI, options)
      return result.data
    } catch (err) {
      if (err.response && err.response.status === 401) {
        return Promise.reject({ status: 401 })
      }
      return Promise.reject({ status: 500 })
    }
  }
}

module.exports = AuthService
