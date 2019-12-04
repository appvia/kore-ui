import React from 'react'
import axios from 'axios'
import { Typography, Card, List, Tag, Avatar, Popconfirm, message } from 'antd'
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

    return axios.all([getTeam(), getTeamMembers()])
      .then(axios.spread(function (team, members) {
        return { team, members }
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

    return (
      <div>
        <Breadcrumb itemText={this.props.team.spec.summary} />
        <Paragraph strong>{this.props.team.spec.description}</Paragraph>
        <Card title="Team members">
          <List
            dataSource={this.state.members.items}
            renderItem={m => (
              <List.Item actions={memberActions(m)}>
                <List.Item.Meta avatar={<Avatar icon="user" />} title={memberName(m)} />
              </List.Item>
            )}
          >
          </List>
        </Card>
      </div>
    )
  }
}

export default TeamDashboard
