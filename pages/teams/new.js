import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { Typography, Button } from 'antd'
const { Title, Paragraph, Text } = Typography

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
    const { user } = this.props
    const { team } = this.state

    return (
      <div>
        <Breadcrumb items={[{text: 'New team'}]} />
        <Title>New Team</Title>
        <NewTeamForm
          user={user}
          team={team}
          handleTeamCreated={this.handleTeamCreated}
        />
        {team ? (
          <div>
            <Paragraph>
              <Text>Choose your cloud provider below to build a cluster</Text>
              <Text strong> OR </Text>
              <Button type="secondary" style={{ marginLeft: '2px', paddingLeft: '10px', paddingRight: '10px' }}>
                <Link href="/teams/[name]" as={`/teams/${team.metadata.name}`}>
                  <a>Skip cluster build</a>
                </Link>
              </Button>
            </Paragraph>
            <ClusterBuildForm
              user={user}
              team={team}
              teamClusters={[]}
            />
          </div>
        ) : null}
      </div>
    )
  }
}

export default NewTeamPage
