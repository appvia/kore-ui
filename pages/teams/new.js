import React from 'react'
import axios from 'axios'
import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title } = Typography

import NewTeamForm from '../../components/forms/NewTeamForm'
import apiRequest from '../../utils/api-request'

class NewTeamPage extends React.Component {

  static getInitialProps = async (ctx) => {
    const plans = await apiRequest(ctx.req, 'get', '/plans')
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
