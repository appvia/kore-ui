module.exports = {
  server: {
    port: process.env.PORT || '3000',
    session: {
      sessionSecret: process.env.SESSION_SECRET || 'sessionsecret',
      url: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
      ttlInSeconds: 1200
    }
  },
  auth: {
    url: process.env.AUTH_URL || 'http://localhost:5556',
    callbackUrl: (process.env.AUTH_URL || 'http://localhost:5556') + '/callback',
    clientId: process.env.AUTH_CLIENT_ID || '12393b111ae937e32181',
    clientSecret: process.env.AUTH_CLIENT_SECRET || 'ZXhhbXBsZS1hcHAtc2VjcmV0'
  },
  hub: {
    baseUrl: process.env.HUB_BASE_URL || 'http://localhost:3000',
    hubAdminTeamName: 'kore-admin',
    ignoreTeams: ['kore-admin', 'kore-default'],
    gtmId: 'GTM-T9THH55'
  },
  hubApi: {
    url: process.env.HUB_API_URL || 'http://localhost:10080/api/v1alpha1',
    token: process.env.HUB_API_TOKEN || 'password'
  }
}