module.exports = user => {
  let expired = false
  if (user.exp) {
    const expiresAtMs = user.exp * 1000
    const expiresAtNowDiff = expiresAtMs - new Date().valueOf()
    expired = expiresAtNowDiff <= 0
  }
  return expired
}
