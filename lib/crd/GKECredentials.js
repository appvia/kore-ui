module.exports = (name, spec) => ({
  apiVersion: 'gke.compute.kore.appvia.io/v1alpha1',
  kind: 'GKECredentials',
  metadata: {
    name,
    namespace: 'hub-admin'
  },
  spec
})
