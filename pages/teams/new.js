import React from 'react'
import PropTypes from 'prop-types'
import { Layout, Typography } from 'antd'
const { Footer } = Layout
const { Title } = Typography

import NewTeamForm from '../../lib/components/forms/NewTeamForm'
import ClusterBuildForm from '../../lib/components/forms/ClusterBuildForm'
import Breadcrumb from '../../lib/components/Breadcrumb'
import copy from '../../lib/utils/object-copy'

class NewTeamPage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    teamAdded: PropTypes.func.isRequired
  }

  state = {
    team: false,
    providers: [],
    plans: { items: [] }
  }

  static staticProps = {
    title: 'Create new team'
  }

  handleTeamCreated = async (team) => {
    this.props.teamAdded(team)
    const state = copy(this.state)
    state.team = team
    this.setState(state)
  }

  render() {
    return (
      <div>
        <Breadcrumb items={[{text: 'New team'}]} />
        <Title>New Team</Title>
        <NewTeamForm
          user={this.props.user}
          team={this.state.team}
          handleTeamCreated={this.handleTeamCreated}
        />
        {this.state.team ? (
          <ClusterBuildForm
            user={this.props.user}
            team={this.state.team}
            teamClusters={[]}
          />
        ) : null}
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
