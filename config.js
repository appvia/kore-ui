module.exports = {
  server: {
    port: process.env.PORT || '3000'
  },
  hubApi: {
    url: process.env.HUB_API_URL || 'http://localhost:9000/api/v1alpha1'
  }
}