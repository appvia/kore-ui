module.exports = (name, spec) => ({
  apiVersion: 'org.hub.appvia.io/v1',
  kind: 'Team',
  metadata: {
    name
  },
  spec,
  status: {}
})