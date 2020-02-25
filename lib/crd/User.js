const axios = require('axios')
const { koreApi } = require('../../config')

const template = (user) => ({
  apiVersion: 'org.kore.appvia.io/v1',
  kind: 'User',
  metadata: {
    name: user.id,
    namespace: 'kore'
  },
  spec: {
    username: user.id,
    email: user.email
  }
})

module.exports = async (user) => {
  console.info(`*** Checking for user ${user.id}`)
  try {
    const requestOptions = {
      headers: {
        'Authorization': `Bearer ${koreApi.token}`
      }
    }
    const userResult = await axios.get(`${koreApi.url}/users/${user.id}`, requestOptions)
    console.info('*** user found', userResult.data)
    return userResult.data
  } catch (err) {
    if (err.response && err.response.status === 404) {
      const userResource = template(user)
      console.info('*** user not found, creating new resource', userResource)
      return userResource
    }
    console.error(`*** unknown error finding user ${user.id}`, err)
    return Promise.reject(err)
  }
}
