const axios = require('axios')

class AuthService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getConfiguredAuthProvider() {
    try {
      const apiUrl = 'http://localhost:9000/api/v1alpha1'
      const result = await axios.get(`${apiUrl}/auth`)
      const providers = result.data.providers
      const configured = result.data.configured || {}
      if (configured.id) {
        return { ...configured, ...(providers.find(p => p.id === configured.id)) }
      }
      return null
    } catch (err) {
      console.error('Error getting auth providers from API', err)
      return Promise.reject(err)
    }
  }

  async setConfiguredAuthProvider(data) {
    try {
      const apiUrl = 'http://localhost:9000/api/v1alpha1'
      await axios.put(`${apiUrl}/auth/configure`, data)
      require('../lib/passport')(data.id)(data.config)
    } catch (err) {
      console.error('Error setting configured auth provider from API', err)
      return Promise.reject(err)
    }
  }
}

module.exports = AuthService
