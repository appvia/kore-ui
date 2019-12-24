module.exports = {
  server: {
    port: process.env.PORT || '3000',
    session: {
      sessionSecret: process.env.SESSION_SECRET || 'sessionsecret',
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      ttlInSeconds: 1200
    }
  },
  hub: {
    baseUrl: process.env.HUB_BASE_URL || 'http://localhost:3000',
    hubAdminTeamName: 'hub-admin',
    gtmId: 'GTM-T9THH55'
  },
  hubApi: {
    url: process.env.HUB_API_URL || 'http://localhost:10080/api/v1alpha1'
  }
}