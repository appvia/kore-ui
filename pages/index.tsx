import * as React from 'react'
import Link from 'next/link'
import Layout from '../components/Layout'
import { NextPage, NextPageContext } from 'next'
import Router from 'next/router'
import { AxiosResponse } from 'axios'
const axios = require('axios').default;

type Props = {
  user?: any
}

const IndexPage: NextPage<Props> = ({ user }) => {
  return (
    <Layout user={user} title="Home Appvia Hub">
      <h1>Hello {user.displayName} 👋</h1>
      <p>
        <Link href="/about">
          <a>About</a>
        </Link>
      </p>
    </Layout>
  )
}

IndexPage.getInitialProps = async ({ req , res }: NextPageContext) => {
  const redirectOnError = () => {
    if(typeof window === 'undefined') {
      (res as any).redirect('/login')
      (res as any).end()
      return {}
    }

    Router.push('/login')
    return {}
  }

  if (req) {
    const session = (req as any).session
    const user = session && session.passport ? session.passport.user : undefined
    if (user) {
      return { user }
    }
    return redirectOnError()
  }

  try {
    const result: AxiosResponse = await axios.get('http://localhost:3000/user')
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
