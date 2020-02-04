const axios = require('axios')
const User = require('../../lib/crd/User')
const { hub } = require('../../config')

class OrgService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  getHeaders(username) {
    return {
      'X-Identity': username,
      'Authorization': `Bearer ${this.hubApi.token}`
    }
  }

  async getOrCreateUser(user) {
    try {
      const userResource = await User(user)
      console.log(`*** putting user ${user.username}`, userResource)
      const userResult = await axios.put(`${this.hubApi.url}/users/${user.username}`, userResource, { headers: this.getHeaders(user.username) })
      const adminTeamMembers = await this.getTeamMembers(hub.hubAdminTeamName, user.username)
      if (adminTeamMembers.length === 1) {
        await this.addUserToTeam(hub.hubAdminTeamName, user.username, user.username)
      }
      const userToReturn = userResult.data
      userToReturn.teams = await this.getUserTeams(user.username, user.username)
      userToReturn.isAdmin = this.isAdmin(userToReturn)
      return userToReturn
    } catch (err) {
      console.error('Error in getOrCreateUser from API', err)
      return Promise.reject(err)
    }
  }

  /* eslint-disable require-atomic-updates */
  async refreshUser(user) {
    user.teams = await this.getUserTeams(user.username, user.username)
    user.isAdmin = this.isAdmin(user)
  }
  /* eslint-enable require-atomic-updates */

  isAdmin(user) {
    return (user.teams || []).filter(t => t.metadata && t.metadata.name === hub.hubAdminTeamName).length > 0
  }

  async getTeamMembers(team, requestingUsername) {
    try {
      const result = await axios.get(`${this.hubApi.url}/teams/${team}/members`, { headers: this.getHeaders(requestingUsername) })
      console.log(`*** found team members for team: ${team}`, result.data.items)
      return result.data.items
    } catch (err) {
      console.error('Error getting team members from API', err)
      return Promise.reject(err)
    }
  }

  async addUserToTeam(team, username, requestingUsername) {
    console.log(`*** adding user ${username} to team ${team}`)
    const headers = { ...this.getHeaders(requestingUsername), 'Content-Type': 'application/json' }
    try {
      await axios.put(`${this.hubApi.url}/teams/${team}/members/${username}`, undefined, { headers })
    } catch (err) {
      console.error('Error adding user to team', err)
      return Promise.reject(err)
    }
  }

  async getUserTeams(username, requestingUsername) {
    try {
      const result = await axios.get(`${this.hubApi.url}/users/${username}/teams`, { headers: this.getHeaders(requestingUsername) })
      return result.data.items
    } catch (err) {
      console.error('Error getting teams for user', err)
      return Promise.reject(err)
    }
  }

  async getTeamBindings(team, requestingUsername) {
    try {
      const result = await axios.get(`${this.hubApi.url}/teams/${team}/bindings`, { headers: this.getHeaders(requestingUsername) })
      return result.data
    } catch (err) {
      if (err.response && err.response.status === 404) {
        return null
      }
      console.error('Error getting team binding from API', err)
      return Promise.reject(err)
    }
  }

  async getTeamGkeCredentials(team, requestingUsername) {
    try {
      const result = await axios.get(`${this.hubApi.url}/teams/${team}/gkecredentials`, { headers: this.getHeaders(requestingUsername) })
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
