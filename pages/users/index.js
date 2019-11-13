import Link from 'next/link'

import List from '../../components/List'
import { sampleFetchWrapper } from '../../utils/sample-api'

const WithInitialProps = ({ items, pathname }) => (
  <div>
    <h1>Users List</h1>
    <p>
      Example fetching data from inside <code>getInitialProps()</code>.
    </p>
    <p>You are currently on: {pathname}</p>
    <List items={items} />
    <p>
      <Link href="/">
        <a>Go home</a>
      </Link>
    </p>
  </div>
)

WithInitialProps.getInitialProps = async ({ pathname }) => {
  // Example for including initial props in a Next.js function component page.
  // Don't forget to include the respective types for any props passed into
  // the component.
  const items = await sampleFetchWrapper(
    'http://localhost:3000/api/users'
  )

  return { items, pathname }
}

export default WithInitialProps
