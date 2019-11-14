const passport = require('passport')

module.exports = (provider) => {
  const path = `./providers/${provider}`
  return require(path)
}
