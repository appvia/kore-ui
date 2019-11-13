import * as React from 'react'
import Link from 'next/link'
import Router from 'next/router'
const axios = require('axios').default;

const IndexPage = ({ user }) => {
  return (
    <div>
      <h1>Hello {user.displayName} 👋</h1>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
    </div>
  )
}

IndexPage.getInitialProps = async ({ req , res }) => {
  const redirectOnError = () => {
    if(typeof window === 'undefined') {
      res.redirect('/login')
      res.end()
      return {}
    }

    Router.push('/login')
    return {}
  }

  if (req) {
    const session = req.session
    const user = session && session.passport ? session.passport.user : undefined
    if (user) {
      return { user }
    }
    return redirectOnError()
  }

  try {
    const result = await axios.get('http://localhost:3000/user')
    console.log('result.data', result.data)
    if (result.data.displayName) {
      return { user: result.data }
    }
    return redirectOnError()
  } catch (err) {
    throw new Error(err.message)
  }
}

export default IndexPage
