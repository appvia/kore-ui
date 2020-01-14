const { auth, hub } = require('../../config')

module.exports = {
  apiVersion: 'core.hub.appvia.io/v1',
  kind: 'IDPClient',
  metadata: {
    name: 'default'
  },
  spec: {
    displayName: 'Hub UI',
    secret: auth.clientSecret,
    id: auth.clientId,
    redirectURIs: [`${hub.baseUrl}/auth/callback`, `${hub.baseUrl}/auth/local/callback`]
  }
}
