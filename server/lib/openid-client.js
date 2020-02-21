const passport = require('passport')
const { Issuer, Strategy } = require('openid-client')

class OpenIdClient {

  constructor(baseUrl, openidConfig, embeddedAuth, authService) {
    this.redirectUrl = `${baseUrl}/auth/callback`
    this.authUrl = openidConfig.url
    this.clientId = openidConfig.clientID
    this.clientSecret = openidConfig.clientSecret
    this.embeddedAuth = embeddedAuth
    this.authService = authService
    this.initialised = false
  }

  async init() {
    try {
      await this.setupAuthClient()
    } catch (err) {
      console.error('Unable to initialise openIdClient, this will be retried later')
      return Promise.resolve()
    }
  }

  async setupAuthClient() {
    if (this.embeddedAuth) {
      await this.authService.setAuthClient()
    }
    const issuer = await Issuer.discover(this.authUrl)
    this.client = new issuer.Client({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      redirect_uris: [this.redirectUrl],
      response_types: ['code']
    })
    this.setupPassport()
    this.initialised = true
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
      return cb(null, { ...tokenSet.claims(), ...tokenSet })
    })
    this.strategyName = strategy.name
    passport.use(strategy)
  }
}

module.exports = OpenIdClient
