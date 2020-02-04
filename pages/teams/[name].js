import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import moment from 'moment'
import Link from 'next/link'
import { Typography, Card, List, Tag, Button, Avatar, Popconfirm, message, Select } from 'antd'
const { Paragraph, Text } = Typography
const { Option } = Select

import Breadcrumb from '../../lib/components/Breadcrumb'
import apiRequest from '../../lib/utils/api-request'
import copy from '../../lib/utils/object-copy'
import asyncForEach from '../../lib/utils/async-foreach'

class TeamDashboard extends React.Component {
  static propTypes = {
    team: PropTypes.object.isRequired,
    members: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    clusters: PropTypes.object.isRequired,
    available: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      teamName: props.team.metadata.name,
      members: props.members,
      allUsers: [],
      membersToAdd: []
    }
  }

  static async getTeamDetails(req, name) {
    const getTeam = () => apiRequest(req, 'get', `/teams/${name}`)
    const getTeamMembers = () => apiRequest(req, 'get', `/teams/${name}/members`)
    const getTeamClusters = () => apiRequest(req, 'get', `/teams/${name}/clusters`)
    const getAvailable = () => apiRequest(req, 'get', `/teams/${name}/allocations?assigned=true`)

    return axios.all([getTeam(), getTeamMembers(), getTeamClusters(), getAvailable()])
      .then(axios.spread(function (team, members, clusters, available) {
        return { team, members, clusters, available }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async (ctx) => {
    const teamDetails = await TeamDashboard.getTeamDetails(ctx.req, ctx.query.name)
    return {
      title: 'Team dashboard',
      ...teamDetails
    }
  }

  getAllUsers = async () => {
    const users = await apiRequest(null, 'get', '/users')
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

  componentDidUpdate(props, state) {
    if (this.props.team.metadata.name !== state.teamName) {
      const state = copy(this.state)
      state.teamName = this.props.team.metadata.name
      state.members = props.members
      this.getAllUsers()
        .then(users => {
          state.allUsers = users
        })
      this.setState(state)
    }
  }

  addTeamMembersUpdated = (membersToAdd) => {
    const state = copy(this.state)
    state.membersToAdd = membersToAdd
    this.setState(state)
  }

  addTeamMembers = async () => {
    const state = copy(this.state)
    const members = state.members

    await asyncForEach(this.state.membersToAdd, async member => {
      await apiRequest(null, 'put', `/teams/${this.props.team.metadata.name}/members/${member}`)
      message.success(`Team member added: ${member}`)
      members.items.push(member)
    })

    state.membersToAdd = []
    this.setState(state)
  }

  deleteTeamMember = (member) => {
    return async () => {
      const team = this.props.team.metadata.name
      try {
        await apiRequest(null, 'delete', `/teams/${team}/members/${member}`)
        const state = copy(this.state)
        const members = state.members
        members.items = members.items.filter(m => m !== member)
        this.setState(state)
        message.success(`Team member deleted: ${member}`)
      } catch (err) {
        console.error('Error deleting team member', err)
        message.error('Error deleting team member, please try again.')
      }
    }
  }

  render() {
    const teamMembers = ['ADD_USER', ...this.state.members.items]

    const memberActions = (member) => {
      const deleteAction = (
        <Popconfirm
          key="delete"
          title="Are you sure you want to delete this user?"
          onConfirm={this.deleteTeamMember(member)}
          okText="Yes"
          cancelText="No"
        >
          <a>Remove</a>
        </Popconfirm>
      )
      if (member !== this.props.user.username) {
        return [deleteAction]
      }
      return []
    }

    const memberName = (member) => (
      <Text>{member} {member === this.props.user.username ? <Tag>You</Tag>: null}</Text>
    )

    const membersAvailableToAdd = this.state.allUsers.filter(user => !this.state.members.items.includes(user))

    const clusterActions = () => {
      // no actions at present
      return []
    }

    return (
      <div>
        <Breadcrumb items={[{text: this.props.team.spec.summary}]} />
        <Paragraph strong>{this.props.team.spec.description}</Paragraph>
        <Card className="team-members" title="Team members" style={{ marginBottom: '16px' }}>
          <List
            dataSource={teamMembers}
            renderItem={m => {
              if (m === 'ADD_USER') {
                return <List.Item style={{ paddingTop: '0' }} actions={[<Button key="add" type="primary" onClick={this.addTeamMembers}>Add</Button>]}>
                  <List.Item.Meta
                    title={
                      <Select
                        mode="multiple"
                        placeholder="Add existing users to this team"
                        onChange={this.addTeamMembersUpdated}
                        style={{ width: '100%' }}
                        value={this.state.membersToAdd}
                      >
                        {membersAvailableToAdd.map((user, idx) => (
                          <Option key={idx} value={user}>{user}</Option>
                        ))}
                      </Select>
                    }
                  />
                </List.Item>
              } else {
                return <List.Item actions={memberActions(m)}>
                  <List.Item.Meta avatar={<Avatar icon="user" />} title={memberName(m)} />
                </List.Item>
              }
            }}
          >
          </List>
        </Card>
        <Card
          title="Clusters"
          style={{ marginBottom: '20px' }}
          extra={
            <Button type="primary">
              <Link href="/teams/[name]/clusters/new" as={`/teams/${this.props.team.metadata.name}/clusters/new`}>
                <a>+ New Cluster</a>
              </Link>
            </Button>
          }
        >
          <List
            dataSource={this.props.clusters.items}
            renderItem={cluster => {
              const provider = this.props.available.items.find(a => a.metadata.name === cluster.spec.provider.name)
              const created = moment(cluster.metadata.creationTimestamp).fromNow()
              return (
                <List.Item actions={clusterActions()}>
                  <List.Item.Meta
                    avatar={<Avatar icon="cluster" />}
                    title={<Text>{provider.spec.name} <Text style={{ fontFamily: 'monospace', marginLeft: '15px' }}>{cluster.metadata.name}</Text></Text>}
                    description={<Text type='secondary'>Created {created}</Text>}
                  />
                  <Tag color="#5cdbd3">{cluster.status.status}</Tag>
                </List.Item>
              )
            }}
          >
          </List>
        </Card>
      </div>
    )
  }
}

export default TeamDashboard
