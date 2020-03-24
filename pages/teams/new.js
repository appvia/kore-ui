import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { Typography, Button, Card, List, Row, Col, Icon, Alert, message, Select, Tooltip } from 'antd'
const { Title, Paragraph, Text } = Typography

import NewTeamForm from '../../lib/components/forms/NewTeamForm'
import ClusterBuildForm from '../../lib/components/forms/ClusterBuildForm'
import InviteLink from '../../lib/components/team/InviteLink'
import Breadcrumb from '../../lib/components/Breadcrumb'
import copy from '../../lib/utils/object-copy'
import apiRequest from '../../lib/utils/api-request'
import apiPaths from '../../lib/utils/api-paths'
import asyncForEach from '../../lib/utils/async-foreach'

class NewTeamPage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    teamAdded: PropTypes.func.isRequired
  }

  state = {
    team: false,
    members: [],
    membersToAdd: [],
    providers: [],
    plans: { items: [] }
  }

  static staticProps = {
    title: 'Create new team'
  }

  getAllUsers = async () => {
    const users = await apiRequest(null, 'get', apiPaths.users)
    if (users.items) {
      return users.items.map(user => user.spec.username).filter(user => user !== 'admin')
    }
    return []
  }

  componentDidMount() {
    return this.getAllUsers()
      .then(users => {
        const state = copy(this.state)
        state.allUsers = users
        this.setState(state)
      })
  }

  handleTeamCreated = async (team) => {
    this.props.teamAdded(team)
    const state = copy(this.state)
    state.members.push(this.props.user.id)
    state.team = team
    this.setState(state)
  }

  addTeamMembers = async () => {
    const team = this.state.team.metadata.name
    const members = state.members
    const state = copy(this.state)

    await asyncForEach(this.state.membersToAdd, async member => {
      await apiRequest(null, 'put', `${apiPaths.team(team).members}/${member}`)
      message.success(`Team member added: ${member}`)
      members.push(member)
    })

    state.membersToAdd = []
    this.setState(state)
  }

  addTeamMembersUpdated = membersToAdd => {
    const state = copy(this.state)
    state.membersToAdd = membersToAdd
    this.setState(state)
  }

  deleteTeamMember = member => {
    return async () => {
      const team = this.state.team.metadata.name
      try {
        await apiRequest(null, 'delete', `${apiPaths.team(team).members}/${member}`)
        const state = copy(this.state)
        state.members = state.members.filter(m => m !== member)
        this.setState(state)
        message.success(`Team member removed: ${member}`)
      } catch (err) {
        console.error('Error removing team member', err)
        message.error('Error removing team member, please try again.')
      }
    }
  }

  render() {
    const { user } = this.props
    const { team, members, membersToAdd, allUsers } = this.state

    const membersAvailableToAdd = (allUsers || []).filter(user => !members.includes(user))

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
            <Alert
              message={
                <div>
                  <Text>Configure your team and create a cluster below</Text>
                  <Text strong> OR </Text>
                  <Button type="secondary" style={{ marginLeft: '2px', paddingLeft: '10px', paddingRight: '10px' }}>
                    <Link href="/teams/[name]" as={`/teams/${team.metadata.name}`}>
                      <a>Skip to team dashboard</a>
                    </Link>
                  </Button>
                </div>
              }
              type="info"
            />

            <Card title="Add people to your team" style={{ marginBottom: '30px', marginTop: '20px' }}>
              <Row gutter={30}>
                <Col span={16}>
                  <Paragraph style={{ marginBottom: '20px' }}>
                    <Alert message="Add existing Kore users or share the invite link" type="info" />
                  </Paragraph>
                  <List>
                    <List.Item style={{ paddingTop: '0' }} actions={[<Button style={{ marginRight: '-8px' }} key="add" type="primary" onClick={this.addTeamMembers}>Add</Button>]}>
                      <List.Item.Meta
                        title={
                          <Select
                            mode="multiple"
                            placeholder="Add existing users to this team"
                            onChange={this.addTeamMembersUpdated}
                            style={{ width: '100%' }}
                            value={membersToAdd}
                          >
                            {membersAvailableToAdd.map((user, idx) => (
                              <Select.Option key={idx} value={user}>{user}</Select.Option>
                            ))}
                          </Select>
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <InviteLink team={team.metadata.name} />
                    </List.Item>
                  </List>
                </Col>
                <Col span={8}>
                  <List
                    header={
                      <Text strong style={{ fontSize: '16px' }}>Team members</Text>
                    }
                    size="small"
                    split={false}
                    dataSource={members}
                    renderItem={m => {
                      const actions = m !== user.id ? [<Tooltip key="remove_member" title="Remove member"><Icon type="delete" onClick={this.deleteTeamMember(m)} /></Tooltip>] : []
                      return <List.Item actions={actions}>{m}</List.Item>
                    }}>
                  </List>
                </Col>
              </Row>
            </Card>

            <Card title="Create a cluster for your team">
              <Alert message="Choose a cloud provider below to create a cluster" type="info" />
              <ClusterBuildForm
                user={user}
                team={team}
                teamClusters={[]}
              />
            </Card>
          </div>
        ) : null}
      </div>
    )
  }
}

export default NewTeamPage
