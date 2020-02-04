const axios = require('axios')
const IDPClient = require('../../lib/crd/IDPClient')
const IDP = require('../../lib/crd/IDP')
const copy = require('../../lib/utils/object-copy')

class AuthService {
  constructor(hubApi, baseUrl) {
    this.hubApi = hubApi
    this.baseUrl = baseUrl
    this.requestOptions = {
      headers: {
        'X-Identity': 'admin',
        'Authorization': `Bearer ${hubApi.token}`
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
      console.log('Creating auth client', IDPClient)
      await axios.put(`${this.hubApi.url}/idp/clients/hub-ui`, IDPClient, this.requestOptions)
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
      console.log('setting default IDP', idp)
      await axios.put(`${this.hubApi.url}/idp/configured/default`, idp, this.requestOptions)
    } catch (err) {
      console.error('Error setting configured auth provider from API', err)
      return Promise.reject(err)
    }
  }

  async authenticateLocalUser({ username, password }) {
    try {
      const options = copy(this.requestOptions)
      options.auth = { username, password }
      const result = await axios.get(`${this.hubApi.url}/whoami`, options)
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
