module.exports = {
  statusColorMap: {
    'Success': 'green',
    'Pending': 'orange'
  },
  clusterProviderIconSrcMap: {
    'GKE': '/static/images/GKE.png',
    'EKS': '/static/images/EKS.png'
  },
  verifiedStatusMessageMap: {
    'Success': 'Verified',
    'Failure': 'Not Verified',
    'Pending': 'Verifying'
  },
  inProgressStatusList: ['Pending', 'Deleting']
}
