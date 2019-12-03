module.exports = {
  server: {
    port: process.env.PORT || '3000',
    sessionSecret: process.env.SESSION_SECRET || 'sessionsecret'
  },
  hub: {
    baseUrl: process.env.HUB_BASE_URL || 'http://localhost:3000',
    hubAdminTeamName: 'hub-admin'
  },
  hubApi: {
    url: process.env.HUB_API_URL || 'http://localhost:10080/api/v1alpha1'
  }
}