module.exports = (spec) => ({
  apiVersion: 'gke.compute.hub.appvia.io/v1alpha1',
  kind: 'GKECredentials',
  metadata: {
    name: "gke"
  },
  spec
})
