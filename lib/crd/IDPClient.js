const { auth, kore } = require('../../config')

module.exports = {
  apiVersion: 'core.kore.appvia.io/v1',
  kind: 'IDPClient',
  metadata: {
    name: 'default'
  },
  spec: {
    displayName: 'Kore UI',
    secret: auth.openid.clientSecret,
    id: auth.openid.clientID,
    redirectURIs: [`${kore.baseUrl}/auth/callback`]
  }
}
