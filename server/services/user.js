const axios = require('axios')
const user = require('../models/user')
const { hub } = require('../../config')

class UserService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getOrCreateUser(username) {
    const userResource = user(username)
    return axios.all([
      axios.put(`${this.hubApi.url}/user/${userResource.metadata.name}`, userResource),
      axios.get(`${this.hubApi.url}/user/${userResource.metadata.name}/teams`)
    ])
      .then(axios.spread(function (userResult, teamsResult) {
        return { ...userResult.data, teams: teamsResult.data }
      }))
      .catch(err => {
        console.error('Error getting user info from API', err)
        return Promise.reject(err)
      })
  }

  isAdmin(user) {
    const teams = user.teams.items || []
    return Boolean(teams.filter(t => t.spec.team === hub.hubAdminTeamName).length)
  }
}

module.exports = UserService
