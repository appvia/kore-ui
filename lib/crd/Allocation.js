module.exports = (name, spec) => ({
  apiVersion: 'config.hub.appvia.io/v1',
  kind: 'Allocation',
  metadata: {
    name,
    namespace: 'hub-admin'
  },
  spec
})
