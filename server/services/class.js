const axios = require('axios')

class ClassService {
  constructor(hubApi) {
    this.hubApi = hubApi
  }

  async getClasses({ category }) {
    try {
      const url = `${this.hubApi.url}/classes` + (category ? `?category=${category}` : '')
      const result = await axios.get(url)
      return result.data
    } catch (err) {
      console.error('Error getting classes from API', err)
      return Promise.reject(err)
    }
  }

  async putTeamClass({ team, className, resource}) {
    try {
      const result = await axios.put(`${this.hubApi.url}/teams/${team}/classes/${className}`, resource)
      return result.data
    } catch (err) {
      console.error('Error putting team class from API', err)
      return Promise.reject(err)
    }
  }
}

module.exports = ClassService
