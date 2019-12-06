import React from 'react'
import axios from 'axios'
import moment from 'moment'
import Link from 'next/link'
import { Typography, Card, List, Tag, Button, Avatar, Popconfirm, message } from 'antd'
const { Paragraph, Text } = Typography

import Breadcrumb from '../../lib/components/Breadcrumb'
import apiRequest from '../../lib/utils/api-request'

class TeamDashboard extends React.Component {
  state = {
    teamName: this.props.team.metadata.name,
    members: this.props.members
  }

  componentDidUpdate(props, state) {
    if (this.props.team.metadata.name !== state.teamName) {
      this.setState({
        teamName: this.props.team.metadata.name,
        members: props.members
      })
    }
  }

  static async getTeamDetails(req, name) {
    const getTeam = () => apiRequest(req, 'get', `/teams/${name}`)
    const getTeamMembers = () => apiRequest(req, 'get', `/teams/${name}/members`)
    const getTeamResources = () => apiRequest(req, 'get', `/teams/${name}/resources`)

    return axios.all([getTeam(), getTeamMembers(), getTeamResources()])
      .then(axios.spread(function (team, members, resources) {
        return { team, members, resources }
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

  deleteTeamMember = (member) => {
    return async () => {
      const team = this.props.team.metadata.name
      try {
        await apiRequest(null, 'delete', `/teams/${team}/members/${member}`)
        const members = this.state.members
        members.items = members.items.filter(m => m !== member)
        this.setState({ teamName: this.state.teamName, members })
        message.success('Team member deleted')
      } catch (err) {
        console.error('Error deleting team member', err)
        message.error('Error deleting team member, please try again.')
      }
    }
  }

  render() {
    const memberActions = (member) => {
      const deleteAction = (
        <Popconfirm
          key="delete"
          title="Are you sure delete this user?"
          onConfirm={this.deleteTeamMember(member)}
          okText="Yes"
          cancelText="No"
        >
          <a>Delete user</a>
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

    const clusters = this.props.resources.items.filter(r => r.kind === 'Kubernetes')

    return (
      <div>
        <Breadcrumb items={[{text: this.props.team.spec.summary}]} />
        <Paragraph strong>{this.props.team.spec.description}</Paragraph>
        <Card title="Team members" style={{ marginBottom: '16px' }}>
          <List
            dataSource={this.state.members.items}
            renderItem={m => (
              <div>
                <List.Item actions={memberActions(m)}>
                  <List.Item.Meta avatar={<Avatar icon="user" />} title={memberName(m)} />
                </List.Item>
              </div>
            )}
          >
          </List>
        </Card>
        <Card
          title="Clusters"
          style={{ marginBottom: '20px' }}
          extra={
            <Button type="primary">
              <Link href="/teams/[name]/clusters/new" as="/teams/dave/clusters/new">
                <a>+ New Cluster</a>
              </Link>
            </Button>
          }
        >
          <List
            dataSource={clusters}
            renderItem={cluster => {
              const useResource = this.props.resources.items.find(resource => resource.kind === cluster.spec.use.kind && resource.metadata.name === cluster.spec.use.name)
              const created = moment(cluster.metadata.creationTimestamp).fromNow()
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon="cluster" />}
                    title={cluster.metadata.name}
                    description={<Text type='secondary'>{created}</Text>}
                  />
                  <Tag color="#5cdbd3">{useResource.status.status}</Tag>
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
