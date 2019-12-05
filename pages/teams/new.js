import React from 'react'
import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title } = Typography

import NewTeamForm from '../../lib/components/forms/NewTeamForm'
import ClusterBuildForm from '../../lib/components/forms/ClusterBuildForm'
import apiRequest from '../../lib/utils/api-request'

class NewTeamPage extends React.Component {
  state = {
    team: false,
    providers: [],
    plans: []
  }

  static staticProps = {
    title: 'Create new team'
  }

  waitForAvailableClusterProviders = async (teamName, attempt) => {
    const MAX_ATTEMPTS = 3
    if ((attempt || 1) > MAX_ATTEMPTS) {
      return []
    }
    const available = await apiRequest(null, 'get', `/teams/${teamName}/available`)
    const providers = available.items.filter(a => a.spec.category === 'cluster')
    if (providers.length === 0) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      return await this.waitForAvailableClusterProviders(teamName, attempt + 1)
    }
    return providers
  }

  getProviderPlans = async (team) => {
    const [ plans, providers ] = await Promise.all([
      apiRequest(null, 'get', '/plans'),
      this.waitForAvailableClusterProviders(team.metadata.name)
    ])
    return { providers, plans }
  }

  handleTeamCreated = async (team) => {
    const { providers, plans } = await this.getProviderPlans(team)
    this.setState({
      team,
      providers,
      plans
    })
  }

  render() {
    return (
      <div>
        <Title>New Team</Title>
        <NewTeamForm
          user={this.props.user}
          team={this.state.team}
          handleTeamCreated={this.handleTeamCreated}
        />
        <ClusterBuildForm
          user={this.props.user}
          team={this.state.team}
          plans={this.state.plans}
          providers={this.state.providers}
        />
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
