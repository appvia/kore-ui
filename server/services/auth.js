const axios = require('axios')
const IDPClient = require('../../lib/crd/IDPClient')
const IDP = require('../../lib/crd/IDP')

class AuthService {
  constructor(hubApi, baseUrl) {
    this.hubApi = hubApi
    this.baseUrl = baseUrl
    this.requestOptions = {
      headers: {
        'X-Identity': 'admin'
      }
    }
  }

  async getDefaultConfiguredIdp() {
    try {
      const result = await axios.get(`${this.hubApi.url}/idp/default`, this.requestOptions)
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
      await axios.put(`${this.hubApi.url}/idp/clients/hub-ui`, IDPClient, this.requestOptions)
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
      await axios.put(`${this.hubApi.url}/idp/configured/default`, idp, this.requestOptions)
    } catch (err) {
      console.error('Error setting configured auth provider from API', err)
      return Promise.reject(err)
    }
  }
}

module.exports = AuthService
