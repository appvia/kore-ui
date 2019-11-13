import * as React from 'react'

import ListDetail from '../../components/ListDetail'
import { sampleFetchWrapper } from '../../utils/sample-api'

class InitialPropsDetail extends React.Component {
  static getInitialProps = async ({ query }) => {
    try {
      const { id } = query
      const item = await sampleFetchWrapper(
        `http://localhost:3000/api/users/${Array.isArray(id) ? id[0] : id}`
      )
      return { item }
    } catch (err) {
      return { errors: err.message }
    }
  }

  render() {
    const { item, errors } = this.props

    console.log(this.props)

    if (errors) {
      return (
        <div>
          <p>
            <span style={{ color: 'red' }}>Error:</span> {errors}
          </p>
        </div>
      )
    }

    return (
      <div>
        {item && <ListDetail item={item} />}
      </div>
    )
  }
}

export default InitialPropsDetail
