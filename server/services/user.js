const axios = require('axios')
const user = require('../models/user')
const TeamMembership = require('../models/TeamMembership')
const { hub } = require('../../config')

class UserService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getUserResource(username) {
    console.log(`*** Checking for user ${username}`)
    try {
      const userResult = await axios.get(`${this.hubApi.url}/users/${username}`)
      console.log(`*** user found`, userResult.data)
      return userResult.data
    } catch (err) {
      if (err.response.status === 404) {
        const userResource = user(username)
        console.log(`*** user not found, creating new resource`, userResource)
        return userResource
      }
      console.error(`*** unknown error finding user ${username}`, err)
      return Promise.reject(err)
    }
  }

  async getOrCreateUser(username) {
    try {
      const userResource = await this.getUserResource(username)
      console.log(`*** putting user ${username}`, userResource)
      const userResult = await axios.put(`${this.hubApi.url}/users/${username}`, userResource)
      const adminTeamMembers = await this.getTeamMembers(hub.hubAdminTeamName)
      if (adminTeamMembers.length === 1) {
        await this.addUserToTeam(hub.hubAdminTeamName, userResource.spec.username)
      }
      const teams = await this.getUserTeams(username)
      return { ...userResult.data, teams }
    } catch (err) {
      console.error('Error in getOrCreateUser from API', err)
      return Promise.reject(err)
    }
  }

  isAdmin(user) {
    return (user.teams || []).includes(hub.hubAdminTeamName)
  }

  async getTeamMembers(team) {
    try {
      const result = await axios.get(`${this.hubApi.url}/teams/${team}/members`)
      console.log(`*** found team members for team: ${team}`, result.data.items)
      return result.data.items
    } catch (err) {
      console.error('Error getting team members from API', err)
      return Promise.reject(err)
    }
  }

  async addUserToTeam(team, username) {
    console.log(`*** adding user ${username} to team ${team}`)
    try {
      await axios.put(`${this.hubApi.url}/teams/${team}/members/${username}`, TeamMembership(team, username))
    } catch (err) {
      console.error('Error adding user to team', err)
      return Promise.reject(err)
    }
  }

  async getUserTeams(username) {
    try {
      const result = await axios.get(`${this.hubApi.url}/users/${username}/teams`)
      return result.data.items
    } catch (err) {
      console.error('Error getting teams for user', err)
      return Promise.reject(err)
    }
  }
}

module.exports = UserService
