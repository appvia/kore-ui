module.exports = {
  server: {
    port: process.env.PORT || '3000',
    sessionSecret: process.env.SESSION_SECRET || 'sessionsecret'
  },
  hub: {
    baseUrl: process.env.HUB_BASE_URL || 'http://localhost:3000',
    hubAdminTeamName: 'hub-admins'
  },
  hubApi: {
    url: process.env.HUB_API_URL || 'http://localhost:9000/api/v1alpha1'
  }
}