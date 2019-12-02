const axios = require('axios')
const { hubApi } = require('../../config')

const upsertSpecProperties = (original, updated) => ({ ...original, ...updated })

module.exports = async (provider, spec) => {
  try {
    const result = await axios.get(`${hubApi.url}/auth/${provider}`)
    result.data.spec = upsertSpecProperties(result.data.spec, spec)
    return result.data
  } catch (err) {
    console.error(`Error getting AuthProvider ${provider}`, err)
    return Promise.reject(err)
  }
}
