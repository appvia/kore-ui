import React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import { Typography, Statistic, Icon, Row, Col, Card, Alert, Button } from 'antd'
const { Title, Paragraph } = Typography

import apiRequest from '../lib/utils/api-request'
import apiPaths from '../lib/utils/api-paths'
import { kore } from '../config'

class IndexPage extends React.Component {
  static propTypes = {
    user: PropTypes.object.isRequired,
    allUsers: PropTypes.object.isRequired,
    allTeams: PropTypes.object.isRequired,
    adminMembers: PropTypes.object,
    gkeCredentials: PropTypes.object
  }

  static staticProps = {
    title: 'Appvia Kore Dashboard'
  }

  static async getPageData(ctx) {
    const { user } = ctx
    let allTeams
    let allUsers
    let adminMembers
    let gkeCredentials

    if (user.isAdmin) {
      [ allTeams, allUsers, adminMembers, gkeCredentials ] = await Promise.all([
        apiRequest(ctx, 'get', apiPaths.teams),
        apiRequest(ctx, 'get', apiPaths.users),
        apiRequest(ctx, 'get', apiPaths.team(kore.koreAdminTeamName).members),
        apiRequest(ctx, 'get', apiPaths.team(kore.koreAdminTeamName).gkeCredentials)
      ])
    } else {
      [ allTeams, allUsers ] = await Promise.all([
        apiRequest(ctx, 'get', apiPaths.teams),
        apiRequest(ctx, 'get', apiPaths.users)
      ])
    }

    allTeams.items = (allTeams.items || []).filter(t => !kore.ignoreTeams.includes(t.metadata.name))
    return { allTeams, allUsers, adminMembers, gkeCredentials }
  }

  static getInitialProps = async (ctx) => {
    const data = await IndexPage.getPageData(ctx)
    return data
  }

  render() {
    const { user, allTeams, allUsers, adminMembers, gkeCredentials } = this.props
    const userTeams = (user.teams || []).filter(t => !kore.ignoreTeams.includes(t.metadata.name))
    const noUserTeamsExist = userTeams.length === 0
    const integrationMissing = gkeCredentials && gkeCredentials.items.length === 0

    const NoTeamInfoAlert = () => noUserTeamsExist ? (
      <Alert
        message="You are not part of a team"
        description={
          <div>
            <Paragraph style={{ marginTop: '10px' }}>Teams are everything in Kore, we recommend creating a team now to get started.</Paragraph>
            <Button type="secondary">
              <Link href="/teams/new">
                <a>Create a new team</a>
              </Link>
            </Button>
          </div>
        }
        type="info"
        showIcon
        style={{ marginTop: '30px' }}
      />
    ) : null

    const IntegrationWarning = () => integrationMissing ? (
      <Alert
        message="No integrations configured"
        description={
          <div>
            <Paragraph style={{ marginTop: '10px' }}>Without integrations Kore will be unable to create clusters for teams.</Paragraph>
            <Button type="secondary">
              <Link href="/configure/integrations">
                <a>Go to integration settings</a>
              </Link>
            </Button>
          </div>
        }
        type="warning"
        showIcon
        style={{ marginTop: '30px' }}
      />
    ) : null

    const TeamStats = () => (
      <Card title="Teams" extra={<Icon type="team" />}>
        <Row gutter={16}>
          <Col span={12}>
            <Statistic style={{ textAlign: 'center' }} title="Yours" value={userTeams.length} valueStyle={{ color: noUserTeamsExist ? 'orange' : '' }} />
          </Col>
          <Col span={12}>
            <Statistic style={{ textAlign: 'center' }} title="Total" value={allTeams.items.length} />
          </Col>
        </Row>
      </Card>
    )

    const UserStats = () => (
      <Card title="Users" extra={<Icon type="user" />}>
        <Row gutter={16}>
          {user.isAdmin ? (
            <div>
              <Col span={12}>
                <Statistic style={{ textAlign: 'center' }} title="Total" value={allUsers.items.length} />
              </Col>
              <Col span={12}>
                <Statistic style={{ textAlign: 'center' }} title="Admins" value={adminMembers.items.length} />
              </Col>
            </div>
          ) : (
            <Col span={24}>
              <Statistic style={{ textAlign: 'center' }} title="Total" value={allUsers.items.length} />
            </Col>
          )}
        </Row>
      </Card>
    )

    const AdminView = () => (
      <div>
        <IntegrationWarning/>
        <NoTeamInfoAlert />
        <Row gutter={16} type="flex" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <Col span={8}>
            <TeamStats />
          </Col>
          <Col span={8}>
            <UserStats />
          </Col>
          <Col span={8}>
            <Card title="Integrations" extra={<Icon type="api" />}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic style={{ textAlign: 'center' }} title="GKE" value={gkeCredentials.items.length} valueStyle={{ color: integrationMissing ? 'orange' : '' }} />
                </Col>
                <Col span={12}>
                  <Statistic style={{ textAlign: 'center' }} title="EKS" value="0" />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </div>
    )

    const UserView = () => (
      <div>
        <NoTeamInfoAlert />
        <Row gutter={16} type="flex" style={{ marginTop: '40px', marginBottom: '40px' }}>
          <Col span={8}>
            <TeamStats />
          </Col>
          <Col span={5}>
            <UserStats />
          </Col>
        </Row>
      </div>
    )

    return (
      <div>
        <Title level={1} style={{ marginBottom: '0' }}>Appvia Kore</Title>
        <Title level={4} type="secondary" style={{ marginTop: '10px' }}>Kubernetes for Teams, Making Cloud Simple for Developers and DevOps</Title>
        {user.isAdmin ? <AdminView /> : <UserView />}
      </div>
    )
  }
}

export default IndexPage
