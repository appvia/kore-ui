module.exports = (name, spec) => ({
  apiVersion: 'gke.compute.hub.appvia.io/v1alpha1',
  kind: 'GKECredentials',
  metadata: {
    name,
    namespace: 'hub-admin'
  },
  spec
})
