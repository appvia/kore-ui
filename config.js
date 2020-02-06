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
    url: process.env.DEX_PUBLIC_URL || 'http://localhost:5556',
    callbackUrl: (process.env.DEX_PUBLIC_URL || 'http://localhost:5556') + '/callback',
    clientId: process.env.KORE_UI_CLIENT_ID || '12393b111ae937e32181',
    clientSecret: process.env.KORE_UI_CLIENT_SECRET || 'ZXhhbXBsZS1hcHAtc2VjcmV0'
  },
  kore: {
    baseUrl: process.env.KORE_BASE_URL || 'http://localhost:3000',
    koreAdminTeamName: 'kore-admin',
    ignoreTeams: ['kore-admin', 'kore-default'],
    gtmId: 'GTM-T9THH55'
  },
  koreApi: {
    url: process.env.KORE_API_URL || 'http://localhost:10080/api/v1alpha1',
    token: process.env.KORE_API_TOKEN || 'password'
  }
}