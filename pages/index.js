import * as React from 'react'
import Link from 'next/link'

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

IndexPage.getInitialProps = () => ({
  title: 'Home'
})

export default IndexPage
