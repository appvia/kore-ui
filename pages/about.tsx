import * as React from 'react'
import Link from 'next/link'

const AboutPage: React.FunctionComponent = () => (
  <div>
    <h1>About</h1>
    <p>This is the about page</p>
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </div>
)

export default AboutPage
