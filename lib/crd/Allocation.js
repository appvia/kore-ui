module.exports = (name, spec) => ({
  apiVersion: 'config.kore.appvia.io/v1',
  kind: 'Allocation',
  metadata: {
    name,
    namespace: 'kore-admin'
  },
  spec
})
