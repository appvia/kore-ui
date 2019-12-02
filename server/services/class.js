const axios = require('axios')

class ClassService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async putTeamClass({ team, className, resource}) {
    try {
      const bindingResult = await axios.put(`${this.hubApi.url}/teams/${team}/bindings/${className}`, resource)
      // allocate this binding to all teams
      await axios.put(`${this.hubApi.url}/teams/${team}/bindings/${className}/allocation/allteams`, { headers: {'Content-Type': 'application/json'} })
      return bindingResult.data
    } catch (err) {
      console.error('Error putting team class from API', err)
      return Promise.reject(err)
    }
  }

  async getTeamBindingByName(team, bindingName) {
    try {
      const result = await axios.get(`${this.hubApi.url}/teams/${team}/bindings/${bindingName}`)
      return result.data
    } catch (err) {
      if (err.response.status === 404) {
        return null
      }
      console.error('Error getting team binding from API', err)
      return Promise.reject(err)
    }
  }
}

module.exports = ClassService
