module.exports = (orgService, authService, koreConfig, userClaimsOrder, embeddedAuth) => {
  return async (req, res) => {
    const session = req.session
    const user = session.passport.user
    if (session.localUser) {
      user.id = user.username
    } else {
      userClaimsOrder.some(c => {
        user.id = user[c]
        return user.id
      })
    }
    try {
      const userInfo = await orgService.getOrCreateUser(user)

      /* eslint-disable require-atomic-updates */
      user.teams = userInfo.teams || []
      user.isAdmin = userInfo.isAdmin
      /* eslint-enable require-atomic-updates */
      if (session.requestedPath) {
        return res.redirect(session.requestedPath)
      }

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
          const gkeCredentials = await orgService.getTeamGkeCredentials(koreConfig.koreAdminTeamName, user.id_token)
          if (gkeCredentials.items.length === 0) {
            /* eslint-disable-next-line require-atomic-updates */
            redirectPath = '/setup/kore'
          }
        }
      }
      res.redirect(redirectPath)

    } catch (err) {
      /* eslint-disable-next-line require-atomic-updates */
      req.session.loginError = 500
      return res.redirect('/login')
    }
  }
}
