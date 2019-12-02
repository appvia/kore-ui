const axios = require('axios')
const { hubApi } = require('../../config')

const template = (username) => ({
  apiVersion: 'org.hub.appvia.io/v1',
  kind: 'User',
  metadata: {
    name: username
  },
  spec: {
    username
  }
})

module.exports = async (username) => {
  console.log(`*** Checking for user ${username}`)
  try {
    const userResult = await axios.get(`${hubApi.url}/users/${username}`)
    console.log(`*** user found`, userResult.data)
    return userResult.data
  } catch (err) {
    if (err.response.status === 404) {
      const userResource = template(username)
      console.log(`*** user not found, creating new resource`, userResource)
      return userResource
    }
    console.error(`*** unknown error finding user ${username}`, err)
    return Promise.reject(err)
  }
}
