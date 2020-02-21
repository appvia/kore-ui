import axios from 'axios'
import redirect from './redirect'
import { koreApi } from '../../config'
import checkUserExpired from '../../server/lib/user-expired'

export default async (reqRes, method, apiPath, body, options) => {
  const req = reqRes && reqRes.req
  const res = reqRes && reqRes.res
  options = options || {}
  if (req) {
    const user = req.session.passport.user
    options.headers = { ...options.headers, 'Authorization': `Bearer ${user.id_token}` }
    const userExpired = checkUserExpired(user)
    if (userExpired) {
      return res.redirect('/login/refresh')
    }
  }
  let url = req ? `${koreApi.url}${apiPath}` : `${window.location.origin}/apiproxy${apiPath}`
  try {
    console.info('Making api request', method, url)
    const result = await axios[method](
      url,
      ['get', 'delete'].includes(method) ? options : body,
      ['get', 'delete'].includes(method) ? undefined : options
    )
    return result.data
  } catch (err) {
    if (err.response && err.response.status === 401) {
      redirect(null, '/login/refresh', true)
      return Promise.reject(err)
    }
    console.error(`Error making api request, method: "${method}", url: "${url}"`, err.message)
    return method === 'get' ? {} : Promise.reject(err)
  }
}
