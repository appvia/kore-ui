const axios = require('axios').default

class AuthService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getConfiguredAuthProvider() {
    try {
      const result = await axios.get(`${this.hubApi.url}/auth`)
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
}

module.exports = AuthService
