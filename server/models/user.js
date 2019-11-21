module.exports = (username) => ({
  apiVersion: 'org.hub.appvia.io/v1',
  kind: 'User',
  metadata: {
    name: username
  },
  spec: {
    username
  }
})
