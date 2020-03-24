const axios = require('axios')
const User = require('../../lib/crd/User')
const apiPaths = require('../../lib/utils/api-paths')
const { kore } = require('../../config')

class OrgService {
  constructor(koreApi) {
    this.koreApi = koreApi
  }

  getHeaders(token) {
    return {
      'Authorization': `Bearer ${token}`
    }
  }

  async getOrCreateUser(user) {
    try {
      const userResource = await User(user)
      console.log(`*** putting user ${user.id}`, userResource)
      const userResult = await axios.put(`${this.koreApi.url}${apiPaths.users}/${user.id}`, userResource, { headers: this.getHeaders(this.koreApi.token) })
      const adminTeamMembers = await this.getTeamMembers(kore.koreAdminTeamName, this.koreApi.token)
      if (adminTeamMembers.length === 1) {
        await this.addUserToTeam(kore.koreAdminTeamName, user.id, this.koreApi.token)
      }
      const userToReturn = userResult.data
      userToReturn.teams = await this.getUserTeams(user.id, user.id_token)
      userToReturn.isAdmin = this.isAdmin(userToReturn)
      return userToReturn
    } catch (err) {
      console.error('Error in getOrCreateUser from API', err)
      return Promise.reject(err)
    }
  }

  /* eslint-disable require-atomic-updates */
  async refreshUser(user) {
    user.teams = await this.getUserTeams(user.id, user.id_token)
    user.isAdmin = this.isAdmin(user)
  }
  /* eslint-enable require-atomic-updates */

  isAdmin(user) {
    return (user.teams || []).filter(t => t.metadata && t.metadata.name === kore.koreAdminTeamName).length > 0
  }

  async getTeamMembers(team, requestingIdToken) {
    try {
      const result = await axios.get(this.koreApi.url + apiPaths.team(team).members, { headers: this.getHeaders(requestingIdToken) })
      console.log(`*** found team members for team: ${team}`, result.data.items)
      return result.data.items
    } catch (err) {
      console.error('Error getting team members from API', err)
      return Promise.reject(err)
    }
  }

  async addUserToTeam(team, username, requestingIdToken) {
    console.log(`*** adding user ${username} to team ${team}`)
    const headers = { ...this.getHeaders(requestingIdToken), 'Content-Type': 'application/json' }
    try {
      await axios.put(`${this.koreApi.url}${apiPaths.team(team).members}/${username}`, undefined, { headers })
    } catch (err) {
      console.error('Error adding user to team', err)
      return Promise.reject(err)
    }
  }

  async getUserTeams(username, requestingIdToken) {
    try {
      const result = await axios.get(this.koreApi.url + apiPaths.user(username).teams, { headers: this.getHeaders(requestingIdToken) })
      return result.data.items
    } catch (err) {
      console.error('Error getting teams for user', err)
      return Promise.reject(err)
    }
  }

  async getTeamGkeCredentials(team, requestingIdToken) {
    try {
      const result = await axios.get(this.koreApi.url + apiPaths.team(team).gkeCredentials, { headers: this.getHeaders(requestingIdToken) })
      return result.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null
      }
      console.error('Error getting team GKE credentials from API', err)
      return Promise.reject(err)
    }
  }
}

module.exports = OrgService
