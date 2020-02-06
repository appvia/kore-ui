import React from 'react'
import PropTypes from 'prop-types'
import { Typography, List, Avatar, Tag, message } from 'antd'
const { Text } = Typography

import apiRequest from '../../lib/utils/api-request'
import copy from '../../lib/utils/object-copy'
import Breadcrumb from '../../lib/components/Breadcrumb'

import { hub } from '../../config'

class ConfigureUsersPage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired,
    admins: PropTypes.array.isRequired
  }

  state = {
    users: this.props.users,
    admins: this.props.admins
  }

  static staticProps = {
    title: 'Configure users',
    adminOnly: true
  }

  static getInitialProps = async (ctx) => {
    const users = await apiRequest(ctx.req, 'get', '/users')
    const adminTeamMembers = await apiRequest(ctx.req, 'get', `/teams/${hub.hubAdminTeamName}/members`)
    return {
      users: users.items,
      admins: adminTeamMembers.items
    }
  }

  makeAdmin = (username) => {
    return async () => {
      try {
        await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/members/${username}`)
        const state = copy(this.state)
        state.admins.push(username)
        this.setState(state)
        message.success(`${username} is now admin`)
      } catch (err) {
        console.error('Error trying to make admin')
        message.error(`Failed to make ${username} admin`)
      }
    }
  }

  revokeAdmin = (username) => {
    return async () => {
      try {
        await apiRequest(null, 'delete', `/teams/${hub.hubAdminTeamName}/members/${username}`)
        const state = copy(this.state)
        state.admins = state.admins.filter(m => m !== username)
        this.setState(state)
        message.success(`${username} is no longer admin`)
      } catch (err) {
        console.error('Error trying to revoke admin')
        message.error(`Failed to revoke admin from user ${username}`)
      }
    }
  }

  render() {
    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Users'}]} />
        <List
          dataSource={this.state.users}
          renderItem={user => {
            const isUser = user.spec.username === this.props.user.username
            const isAdmin = this.state.admins.includes(user.spec.username)
            const actions = []
            if (isAdmin && !isUser) {
              actions.push(<Text key="revoke_admin"><a onClick={this.revokeAdmin(user.spec.username)}>Revoke admin</a></Text>)
            }
            if (!isAdmin) {
              actions.push(<Text key="make_admin"><a onClick={this.makeAdmin(user.spec.username)}>Make admin</a></Text>)
            }
            return (
              <List.Item
                key={user.spec.username}
                actions={actions}
              >
                <List.Item.Meta
                  avatar={<Avatar icon="user" />}
                  title={<Text>{user.spec.username} {isAdmin ? <Tag color="green">admin</Tag> : null}{isUser ? <Tag>You</Tag>: null}</Text>}
                  description={user.spec.email}
                />
              </List.Item>
            )
          }}
        >
        </List>
      </div>
    )
  }
}

export default ConfigureUsersPage
