import React from 'react'
import axios from 'axios'
import { Typography, Card, List, Avatar } from 'antd'
const { Paragraph } = Typography

import Breadcrumb from '../../lib/components/Breadcrumb'
import apiRequest from '../../lib/utils/api-request'

class TeamDashboard extends React.Component {

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

  render() {
    return (
      <div>
        <Breadcrumb itemText={this.props.team.spec.summary} />
        <Paragraph strong>{this.props.team.spec.description}</Paragraph>
        <Card title="Team members">
          <List
            dataSource={this.props.members.items}
            renderItem={m => (
              <List.Item>
                <List.Item.Meta avatar={<Avatar icon="user" />} title={m} />
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
