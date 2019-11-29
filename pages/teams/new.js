import React from 'react'
import axios from 'axios'
import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title } = Typography

import NewTeamForm from '../../components/forms/NewTeamForm'
import { hub } from '../../config'

class NewTeamPage extends React.Component {

  static async getClusterPlans() {
    return axios.get(`${hub.baseUrl}/apiproxy/plans`)
      .then(result => {
        console.log('result.data', result.data)
        return result.data
      })
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async () => {
    const plans = await NewTeamPage.getClusterPlans()
    return {
      title: 'Create new team',
      plans
    }
  }

  render() {
    return (
      <div>
        <Title>New Team</Title>
        <NewTeamForm plans={this.props.plans} />
        <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
      <span>
        For more information read the <a href="#">Documentation</a>
      </span>
        </Footer>
      </div>
    )
  }
}

export default NewTeamPage
