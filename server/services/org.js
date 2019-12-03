const axios = require('axios')
const User = require('../../lib/crd/User')
const { hub } = require('../../config')

class OrgService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getOrCreateUser(username) {
    try {
      const userResource = await User(username)
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

  async refreshUser(user) {
    user.teams = await this.getUserTeams(user.username)
    user.isAdmin = this.isAdmin(user)
  }

  isAdmin(user) {
    return (user.teams || []).includes(hub.hubAdminTeamName)
  }

  // async createTeamWithFirstMember(data, username) {
  //   try {
  //     const teamName = canonical(data.teamName)
  //     const spec = {
  //       summary: data.teamName,
  //       description: data.teamDescription
  //     }
  //     const team = Team(teamName, spec)
  //     console.log('about to create team')
  //     await axios.put(`${this.hubApi.url}/teams/${teamName}`, team)
  //     console.log('about to create team member')
  //     await this.addUserToTeam(teamName, username)
  //     // console.log('waiting for 2s')
  //     // await new Promise((resolve) => setTimeout(resolve, 2000))
  //     // console.log('about to create cluster')
  //     // await axios.put(`${this.hubApi.url}/teams/${teamName}/resources/bindings/gke/gke`, GKE(`gcp-gke-${teamName}-notprod`))
  //   } catch (err) {
  //     console.error('Error putting team from API', err)
  //     return Promise.reject(err)
  //   }
  // }

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
      await axios.put(`${this.hubApi.url}/teams/${team}/members/${username}`, { headers: {'Content-Type': 'application/json'} })
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

  async getTeamBindingByName(team, bindingName) {
  try {
    const result = await axios.get(`${this.hubApi.url}/teams/${team}/bindings/${bindingName}`)
    return result.data
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return null
    }
    console.error('Error getting team binding from API', err)
    return Promise.reject(err)
  }
}
}

module.exports = OrgService
