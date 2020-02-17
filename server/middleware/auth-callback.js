module.exports = (orgService, authService, koreConfig, userClaimsOrder, embeddedAuth) => {
  return async (req, res) => {
    const user = req.session.passport.user
    userClaimsOrder.some(c => {
      user.id = user[c]
      return user.id
    })
    const userInfo = await orgService.getOrCreateUser(user)
    /* eslint-disable require-atomic-updates */
    user.teams = userInfo.teams || []
    user.isAdmin = userInfo.isAdmin
    /* eslint-enable require-atomic-updates */
    let redirectPath = '/'
    if (user.isAdmin) {
      if (embeddedAuth) {
        const authProvider = await authService.getDefaultConfiguredIdp()
        if (!authProvider) {
          redirectPath = '/setup/authentication'
        }
      }
      if (redirectPath === '/') {
        // this is hard-coded to check for GKE credentials, but this will need to be more flexible in the future
        const gkeCredentials = await orgService.getTeamGkeCredentials(koreConfig.koreAdminTeamName, user.id)
        if (gkeCredentials.items.length === 0) {
          /* eslint-disable-next-line require-atomic-updates */
          redirectPath = '/setup/kore'
        }
      }
    }
    req.session.save(function() {
      res.redirect(redirectPath)
    })
  }
}
