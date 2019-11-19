module.exports = (emailAddress) => ({
  apiVersion: 'org.hub.appvia.io/v1',
  kind: 'User',
  metadata: {
    annotations: {},
    name: emailAddress.substr(0, emailAddress.indexOf('@')),
    namespace: 'hub'
  },
  spec: {
    username: emailAddress
  }
})
