const axios = require('axios')
const user = require('../models/user')
const { hub } = require('../../config')

class UserService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getOrCreateUser(emailAddress) {
    const body = user(emailAddress)
    return axios.all([
      axios.put(`${this.hubApi.url}/user/${body.metadata.name}`, body),
      axios.get(`${this.hubApi.url}/user/${body.metadata.name}/teams`)
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
