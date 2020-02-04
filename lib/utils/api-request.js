import axios from 'axios'
import { hubApi } from '../../config'

const headers = {
  'Authorization': `Bearer ${hubApi.token}`
}

module.exports = async (req, method, apiPath, body, options) => {
  options = options || {}
  if (req) {
    options.headers = { ...options.headers, ...headers }
  }
  let url = req ? `${hubApi.url}${apiPath}` : `${window.location.origin}/apiproxy${apiPath}`
  try {
    console.info('Making api request', method, url)
    const result = await axios[method](
      url,
      ['get', 'delete'].includes(method) ? options : body,
      ['get', 'delete'].includes(method) ? undefined : options)
    return result.data
  } catch (err) {
    console.error(`Error making api request, method: "${method}", url: "${url}"`, err.message)
    return method === 'get' ? {} : Promise.reject(err)
  }
}