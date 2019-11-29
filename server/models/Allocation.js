module.exports = () => ({
  "apiVersion": "config.hub.appvia.io",
  "kind": "Allocation",
  "metadata": {
    "name": "gke-allocation"
  },
  "spec": {
    "teams": [
      "*"
    ],
    "classRef": {
      "group": "config.hub.appvia.io",
      "version": "v1",
      "kind": "Class",
      "name": "gke",
      "namespace": "hub"
    },
    "instanceRef": {
      "group": "gke.compute.hub.appvia.io",
      "version": "v1alpha1",
      "kind": "GKECredentials",
      "name": "gke",
      "namespace": "team-hub-admin"
    }
  }
})
