import axios from 'axios'
import { hub, hubApi } from '../../config'

module.exports = async (req, method, apiPath, body, options) => {
  let url = req ? `${hubApi.url}${apiPath}` : `${hub.baseUrl}/apiproxy${apiPath}`
  try {
    console.log('making api request', method, url)
    const result = await axios[method](url, body, options)
    return result.data
  } catch (err) {
    console.error(`Error making api request, method: "${method}", url: "${url}"`, err.message)
    return method === 'get' ? {} : Promise.reject(err)
  }
}