const axios = require('axios')

class UserService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getUserInfo(usernme) {
    try {
      const result = await axios.get(`${this.hubApi.url}/user/${usernme}`)
      return result.data
    } catch (err) {
      console.error('Error getting user info from API', err)
      return Promise.reject(err)
    }
  }
}

module.exports = UserService
