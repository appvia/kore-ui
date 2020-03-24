import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import Link from 'next/link'
import Error from 'next/error'
import { Typography, Card, List, Tag, Button, Avatar, Popconfirm, message, Select, Drawer, Badge, Alert, Icon, Modal } from 'antd'
const { Paragraph, Text } = Typography
const { Option } = Select

import Breadcrumb from '../../lib/components/Breadcrumb'
import Cluster from '../../lib/components/team/Cluster'
import NamespaceClaim from '../../lib/components/team/NamespaceClaim'
import InviteLink from '../../lib/components/team/InviteLink'
import NamespaceClaimForm from '../../lib/components/forms/NamespaceClaimForm'
import apiRequest from '../../lib/utils/api-request'
import copy from '../../lib/utils/object-copy'
import asyncForEach from '../../lib/utils/async-foreach'
import apiPaths from '../../lib/utils/api-paths'

class TeamDashboard extends React.Component {
  static propTypes = {
    invitation: PropTypes.bool,
    team: PropTypes.object.isRequired,
    members: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    clusters: PropTypes.object.isRequired,
    namespaceClaims: PropTypes.object.isRequired,
    available: PropTypes.object.isRequired
  }

  static staticProps = {
    title: 'Team dashboard'
  }

  constructor(props) {
    super(props)
    this.state = {
      members: props.members,
      allUsers: [],
      membersToAdd: [],
      clusters: props.clusters,
      createNamespace: false,
      namespaceClaims: props.namespaceClaims
    }
  }

  static async getTeamDetails({ req, res, query }) {
    const name = query.name
    const getTeam = () => apiRequest({ req, res }, 'get', apiPaths.team(name).self)
    const getTeamMembers = () => apiRequest({ req, res }, 'get', apiPaths.team(name).members)
    const getTeamClusters = () => apiRequest({ req, res }, 'get', apiPaths.team(name).clusters)
    const getNamespaceClaims = () => apiRequest({ req, res }, 'get', apiPaths.team(name).namespaceClaims)
    const getAvailable = () => apiRequest({ req, res }, 'get', `${apiPaths.team(name).allocations}?assigned=true`)

    return axios.all([getTeam(), getTeamMembers(), getTeamClusters(), getNamespaceClaims(), getAvailable()])
      .then(axios.spread(function (team, members, clusters, namespaceClaims, available) {
        return { team, members, clusters, namespaceClaims, available }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async ctx => {
    const teamDetails = await TeamDashboard.getTeamDetails(ctx)
    if (Object.keys(teamDetails.team).length === 0 && ctx.res) {
      /* eslint-disable-next-line require-atomic-updates */
      ctx.res.statusCode = 404
    }
    if (ctx.query.invitation === 'true') {
      teamDetails.invitation = true
    }
    return teamDetails
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

  componentDidUpdate(prevProps) {
    const teamFound = Object.keys(this.props.team).length
    const prevTeamName = prevProps.team.metadata && prevProps.team.metadata.name
    if (teamFound && this.props.team.metadata.name !== prevTeamName) {
      const state = copy(this.state)
      state.members = this.props.members
      state.clusters = this.props.clusters
      state.namespaceClaims = this.props.namespaceClaims
      this.getAllUsers()
        .then(users => {
          state.allUsers = users
          this.setState(state)
        })
    }
  }

  addTeamMembersUpdated = membersToAdd => {
    const state = copy(this.state)
    state.membersToAdd = membersToAdd
    this.setState(state)
  }

  addTeamMembers = async () => {
    const state = copy(this.state)
    const members = state.members

    await asyncForEach(this.state.membersToAdd, async member => {
      await apiRequest(null, 'put', `${apiPaths.team(this.props.team.metadata.name).members}/${member}`)
      message.success(`Team member added: ${member}`)
      members.items.push(member)
    })

    state.membersToAdd = []
    this.setState(state)
  }

  deleteTeamMember = member => {
    return async () => {
      const team = this.props.team.metadata.name
      try {
        await apiRequest(null, 'delete', `${apiPaths.team(team).members}/${member}`)
        const state = copy(this.state)
        const members = state.members
        members.items = members.items.filter(m => m !== member)
        this.setState(state)
        message.success(`Team member removed: ${member}`)
      } catch (err) {
        console.error('Error removing team member', err)
        message.error('Error removing team member, please try again.')
      }
    }
  }

  handleResourceUpdated = resourceType => {
    return (updatedResource, done) => {
      const state = copy(this.state)
      const resource = state[resourceType].items.find(r => r.metadata.name === updatedResource.metadata.name)
      resource.status = updatedResource.status
      this.setState(state, done)
    }
  }

  handleResourceDeleted = resourceType => {
    return (name, done) => {
      const state = copy(this.state)
      const resource = state[resourceType].items.find(r => r.metadata.name === name)
      resource.deleted = true
      this.setState(state, done)
    }
  }

  deleteCluster = async (name, done) => {
    const team = this.props.team.metadata.name
    try {
      const state = copy(this.state)
      const cluster = state.clusters.items.find(c => c.metadata.name === name)
      await apiRequest(null, 'delete', `${apiPaths.team(team).clusters}/${cluster.metadata.name}`)
      cluster.status.status = 'Deleting'
      cluster.metadata.deletionTimestamp = new Date()
      this.setState(state, done)
      message.loading(`Cluster deletion requested: ${cluster.metadata.name}`)
    } catch (err) {
      console.error('Error deleting cluster', err)
      message.error('Error deleting cluster, please try again.')
    }
  }

  createNamespace = value => {
    return () => {
      const state = copy(this.state)
      state.createNamespace = value
      this.setState(state)
    }
  }

  handleNamespaceCreated = namespaceClaim => {
    const state = copy(this.state)
    state.createNamespace = false
    state.namespaceClaims.items.push(namespaceClaim)
    this.setState(state)
    message.loading(`Namespace "${namespaceClaim.spec.name}" requested on cluster "${namespaceClaim.spec.cluster.name}"`)
  }

  deleteNamespace = async (name, done) => {
    const team = this.props.team.metadata.name
    try {
      const state = copy(this.state)
      const namespaceClaim = state.namespaceClaims.items.find(nc => nc.metadata.name === name)
      await apiRequest(null, 'delete', `${apiPaths.team(team).namespaceClaims}/${name}`)
      namespaceClaim.status.status = 'Deleting'
      namespaceClaim.metadata.deletionTimestamp = new Date()
      this.setState(state, done)
      message.loading(`Namespace deletion requested: ${namespaceClaim.spec.name}`)
    } catch (err) {
      console.error('Error deleting namespace', err)
      message.error('Error deleting namespace, please try again.')
    }
  }

  clusterAccess = () => {
    const command = `korectl clusters auth -t ${this.props.team.metadata.name}`
    Modal.info({
      title: 'Cluster access',
      content: (
        <div style={{ marginTop: '20px' }}>
          <Paragraph>You can use the Kore CLI to setup access to your team&apos;s clusters</Paragraph>
          <Paragraph className="copy-command" style={{ marginRight: '40px' }} copyable>{command}</Paragraph>
          <Paragraph>This will add local kubernetes configuration to allow you to use <Text style={{ fontFamily: 'monospace' }}>kubectl</Text> to talk to the provisioned cluster(s).</Paragraph>
          <Paragraph>See examples: <a href="https://kubernetes.io/docs/reference/kubectl/overview/" target="_blank" rel="noopener noreferrer">https://kubernetes.io/docs/reference/kubectl/overview/</a></Paragraph>
        </div>
      ),
      width: 700,
      onOk() {}
    })
  }

  render() {
    const { team, user, invitation } = this.props

    if (Object.keys(team).length === 0) {
      return <Error statusCode={404} />
    }

    const { members, namespaceClaims, allUsers, membersToAdd, createNamespace, clusters } = this.state
    const teamMembers = ['ADD_USER', ...members.items]

    const memberActions = member => {
      const deleteAction = (
        <Popconfirm
          key="delete"
          title="Are you sure you want to remove this user?"
          onConfirm={this.deleteTeamMember(member)}
          okText="Yes"
          cancelText="No"
        >
          <a>Remove</a>
        </Popconfirm>
      )
      if (member !== user.id) {
        return [deleteAction]
      }
      return []
    }

    const membersAvailableToAdd = allUsers.filter(user => !members.items.includes(user))
    const hasActiveClusters = Boolean(clusters.items.filter(c => c.status && c.status.status === 'Success').length)

    return (
      <div>
        <Breadcrumb items={[{text: team.spec.summary}]} />
        <Paragraph>
          <Text strong>{team.spec.description}</Text>
          <Text style={{ float: 'right' }}><Text strong>Team ID: </Text>{team.metadata.name}</Text>
        </Paragraph>
        {invitation ? (
          <Alert
            message="You have joined this team from an invitation"
            type="info"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        ) : null}
        <Card
          title={<div><Text style={{ marginRight: '10px' }}>Team members</Text><Badge style={{ backgroundColor: '#1890ff' }} count={members.items.length} /></div>}
          style={{ marginBottom: '16px' }}
          className="team-members"
          extra={<InviteLink team={team.metadata.name} />}
        >
          <List
            dataSource={teamMembers}
            renderItem={m => {
              if (m === 'ADD_USER') {
                return <List.Item style={{ paddingTop: '0' }} actions={[<Button key="add" type="secondary" onClick={this.addTeamMembers}>Add</Button>]}>
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
                          <Option key={idx} value={user}>{user}</Option>
                        ))}
                      </Select>
                    }
                  />
                </List.Item>
              } else {
                return <List.Item actions={memberActions(m)}>
                  <List.Item.Meta avatar={<Avatar icon="user" />} title={<Text>{m} {m === user.id ? <Tag>You</Tag>: null}</Text>} />
                </List.Item>
              }
            }}
          >
          </List>
        </Card>
        <Card
          title={<div><Text style={{ marginRight: '10px' }}>Clusters</Text><Badge style={{ backgroundColor: '#1890ff' }} count={clusters.items.filter(c => !c.deleted).length} /></div>}
          style={{ marginBottom: '20px' }}
          extra={
            <div>
              {hasActiveClusters ?
                <Text style={{ marginRight: '20px' }}><a onClick={this.clusterAccess}><Icon type="eye" theme="twoTone" /> Access</a></Text> :
                null
              }
              <Button type="primary">
                <Link href="/teams/[name]/clusters/new" as={`/teams/${team.metadata.name}/clusters/new`}>
                  <a>+ New</a>
                </Link>
              </Button>
            </div>
          }
        >
          <List
            dataSource={clusters.items}
            renderItem={cluster => {
              const namespaceClaims = (this.state.namespaceClaims.items || []).filter(nc => nc.spec.cluster.name === cluster.metadata.name && !nc.deleted)
              return (
                <Cluster
                  team={team.metadata.name}
                  cluster={cluster}
                  namespaceClaims={namespaceClaims}
                  deleteCluster={this.deleteCluster}
                  handleUpdate={this.handleResourceUpdated('clusters')}
                  handleDelete={this.handleResourceDeleted('clusters')}
                  refreshMs={10000}
                  stateResourceDataKey="cluster"
                  resourceApiPath={`${apiPaths.team(team.metadata.name).clusters}/${cluster.metadata.name}`}
                />
              )
            }}
          >
          </List>
        </Card>

        <Card
          title={<div><Text style={{ marginRight: '10px' }}>Namespaces</Text><Badge style={{ backgroundColor: '#1890ff' }} count={namespaceClaims.items.filter(c => !c.deleted).length} /></div>}
          style={{ marginBottom: '20px' }}
          extra={clusters.items.length > 0 ? <Button type="primary" onClick={this.createNamespace(true)}>+ New</Button> : null}
        >
          <List
            dataSource={namespaceClaims.items}
            renderItem={namespaceClaim =>
              <NamespaceClaim
                team={team.metadata.name}
                namespaceClaim={namespaceClaim}
                deleteNamespace={this.deleteNamespace}
                handleUpdate={this.handleResourceUpdated('namespaceClaims')}
                handleDelete={this.handleResourceDeleted('namespaceClaims')}
                refreshMs={15000}
                stateResourceDataKey="namespaceClaim"
                resourceApiPath={`${apiPaths.team(team.metadata.name).namespaceClaims}/${namespaceClaim.metadata.name}`}
              />
            }
          >
          </List>
        </Card>

        <Drawer
          title="Create namespace"
          placement="right"
          closable={false}
          onClose={this.createNamespace(false)}
          visible={createNamespace}
          width={700}
        >
          <NamespaceClaimForm team={team.metadata.name} clusters={clusters} handleSubmit={this.handleNamespaceCreated} handleCancel={this.createNamespace(false)}/>
        </Drawer>

      </div>
    )
  }
}

export default TeamDashboard
