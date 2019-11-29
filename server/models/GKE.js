module.exports = (name) => ({
  "apiVersion": "gke.compute.hub.appvia.io/v1alpha1",
  "kind": "GKE",
  "metadata": {
    "name": "gke"
  },
  "spec": {
    "name": name,
    "description": "Dev Cluster",
    "size": 1,
    "maxSize": 10,
    "diskSize": 100,
    "imageType": "COS",
    "machineType": "n1-standard-2",
    "authorizedMasterNetworks": [
      {
        "name": "default",
        "cidr": "0.0.0.0/0"
      }
    ],
    "network": "default",
    "subnetwork": "default",
    "enableAutorepair": true,
    "enableAutoscaler": true,
    "enableAutoUpgrade": false,
    "enableHorizontalPodAutoscaler": false,
    "enableHTTPLoadBalancer": true,
    "enableIstio": false,
    "enableStackDriverLogging": false,
    "enableStackDriverMetrics": false,
    "enablePrivateNetwork": true,
    "masterIPV4Cidr": "172.16.0.0/28",
    "maintenanceWindow": "03:00",
    "version": "1.14.8-gke.17"
  }
})
