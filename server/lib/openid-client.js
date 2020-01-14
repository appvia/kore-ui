const passport = require('passport')
const { Issuer, Strategy, generators } = require('openid-client')

class OpenIdClient {

  constructor(baseUrl, authUrl, clientId, clientSecret, authService) {
    this.redirectUrl = `${baseUrl}/auth/callback`
    this.redirectUrlLocalAuth = `${baseUrl}/auth/local/callback`
    this.authUrl = authUrl
    this.clientId = clientId
    this.clientSecret = clientSecret
    this.authService = authService
    this.authClientCreated = false
  }

  async init() {
    await this.createAuthClient()
    const issuer = await Issuer.discover(this.authUrl)
    this.client = new issuer.Client({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uris: [this.redirectUrl],
      response_types: ['code']
    })
    this.setupPassport()
  }

  async createAuthClient() {
    try {
      await this.authService.setAuthClient()
      this.authClientCreated = true
      console.log('Auth client created successfully')
    } catch (err) {
      console.error('Unable to create auth client, this will be retried later')
      return Promise.resolve()
    }
  }

  setupPassport() {
    passport.serializeUser(function(user, cb) {
      cb(null, user)
    })

    passport.deserializeUser(function(obj, cb) {
      cb(null, obj)
    })

    const strategy = new Strategy({
      client: this.client,
      params: {
        scope: 'openid email profile',
      }
    }, function(tokenSet, cb) {
      return cb(null, tokenSet.claims())
    })
    this.strategyName = strategy.name
    passport.use(strategy)
  }

  localUserAuth() {
    const nonce = generators.nonce()
    const authUrl = this.client.authorizationUrl({
      scope: 'openid email profile',
      response_types: 'id_token',
      redirect_uri: this.redirectUrlLocalAuth,
      connector_id: 'local',
      nonce,
    })
    return { authUrl, nonce }
  }

  async localUserAuthCallback(req, nonce) {
    const params = this.client.callbackParams(req)
    const tokenSet = await this.client.callback(this.redirectUrlLocalAuth, params, { nonce })
    return tokenSet.claims()
  }
}

module.exports = OpenIdClient
