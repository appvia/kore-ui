import React from 'react'
import axios from 'axios'
import { Typography, Card, List, Avatar } from 'antd'
const { Paragraph } = Typography

import Breadcrumb from '../../components/Breadcrumb'
import { hub } from '../../config'

class TeamDashboard extends React.Component {

  static async getTeamDetails(name) {
    const getTeam = () => axios.get(`${hub.baseUrl}/apiproxy/teams/${name}`)
    const getTeamMembers = () => axios.get(`${hub.baseUrl}/apiproxy/teams/${name}/members`)

    return axios.all([getTeam(), getTeamMembers()])
      .then(axios.spread(function (teamResult, membersResult) {
        return { team: teamResult.data, members: membersResult.data }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async (ctx) => {
    const teamDetails = await TeamDashboard.getTeamDetails(ctx.query.name)
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
