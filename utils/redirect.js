import Router from 'next/router'

const redirect = (res, path) => {
  if(res) {
    res.redirect(path)
    res.end()
    return {}
  }

  Router.push(path)
  return {}
}

module.exports = redirect
