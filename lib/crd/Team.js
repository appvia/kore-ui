module.exports = (name, spec) => ({
  apiVersion: 'org.kore.appvia.io/v1',
  kind: 'Team',
  metadata: {
    name
  },
  spec
})