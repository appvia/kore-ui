import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Typography, Card, List, Button, Avatar, Icon, Drawer, message, Tooltip } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import copy from '../../lib/utils/object-copy'
import Breadcrumb from '../../lib/components/Breadcrumb'
import GKECredentialsForm from '../../lib/components/forms/GKECredentialsForm'

import { kore } from '../../config'

class ConfigureIntegrationsPage extends React.Component {
  static propTypes = {
    gkeCredentials: PropTypes.object.isRequired,
    allTeams: PropTypes.object.isRequired
  }

  state = {
    gkeCredentials: this.props.gkeCredentials,
    editIntegration: false,
    addNewIntegration: false
  }

  static staticProps = {
    title: 'Configure integrations',
    adminOnly: true
  }

  static async getPageData({ req, res }) {
    const getTeams = () => apiRequest({ req, res }, 'get', '/teams')
    const getGKECredentials = () => apiRequest({ req, res }, 'get', `/teams/${kore.koreAdminTeamName}/gkecredentials`)
    const getAllocations = () => apiRequest({ req, res }, 'get', `/teams/${kore.koreAdminTeamName}/allocations`)

    return axios.all([getGKECredentials(), getTeams(), getAllocations()])
      .then(axios.spread(async function (gkeCredentials, allTeams, allAllocations) {
        allTeams.items = allTeams.items.filter(t => !kore.ignoreTeams.includes(t.metadata.name))

        gkeCredentials.items.forEach(gke => {
          gke.allocation = (allAllocations.items || []).find(alloc => alloc.metadata.name === gke.metadata.name)
        })

        return { gkeCredentials, allTeams }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async ctx => {
    const data = await ConfigureIntegrationsPage.getPageData(ctx)
    return data
  }

  handleEditIntegrationSave = updatedIntegration => {
    const state = copy(this.state)

    const editedIntegration = state.gkeCredentials.items.find(c => c.metadata.name === state.editIntegration.integration.metadata.name)
    editedIntegration.spec = updatedIntegration.spec
    editedIntegration.allocation = updatedIntegration.allocation

    this.setState(state)
    this.clearEditIntegration()
    message.success('Integration updated')
  }

  editIntegration = gkeCredentials => {
    return async () => {
      const state = copy(this.state)
      state.editIntegration = { type: 'GKE', integration: gkeCredentials }
      this.setState(state)
    }
  }

  clearEditIntegration = () => {
    const state = copy(this.state)
    state.editIntegration = false
    this.setState(state)
  }

  addNewIntegration = () => {
    const state = copy(this.state)
    state.addNewIntegration = 'GKE'
    this.setState(state)
  }

  clearAddNewIntegration = () => {
    const state = copy(this.state)
    state.addNewIntegration = false
    this.setState(state)
  }

  handleNewIntegrationSave = async (createdIntegration) => {
    const state = copy(this.state)
    state.gkeCredentials.items.push(createdIntegration)
    state.addNewIntegration = false
    this.setState(state)
    message.success('Integration created')
  }

  render() {
    const { gkeCredentials, editIntegration, addNewIntegration } = this.state
    const getCredentialsAllocations = allocation => {
      if (!allocation) {
        return <Text>No teams <Tooltip title="These credentials are not allocated to any teams, click edit to fix this."><Icon type="warning" theme="twoTone" twoToneColor="orange" /></Tooltip> </Text>
      }
      const allocatedTeams = this.props.allTeams.items.filter(team => allocation.spec.teams.includes(team.metadata.name)).map(team => team.spec.summary)
      return allocatedTeams.length > 0 ? allocatedTeams.join(', ') : 'All teams'
    }

    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="GKE credentials" extra={<Button type="primary" onClick={this.addNewIntegration}>+ New</Button>}>
          <List
            dataSource={gkeCredentials.items}
            renderItem={gke => {
              const displayName = gke.allocation ? (
                <Text>{gke.allocation.spec.name} <Text type="secondary">{gke.allocation.spec.summary}</Text></Text>
              ): (
                <Text>{gke.metadata.name}</Text>
              )
              return (
                <List.Item key={gke.metadata.name} actions={[<Text key="show_creds"><a onClick={this.editIntegration(gke)}><Icon type="eye" theme="filled"/> Edit</a></Text>]}>
                  <List.Item.Meta
                    avatar={<Avatar icon="cloud" />}
                    title={displayName}
                    description={<span>Allocated to: {getCredentialsAllocations(gke.allocation)}</span>}
                  />
                </List.Item>
              )
            }}
          >
          </List>
          {editIntegration ? (
            <Drawer
              title={
                editIntegration.integration.allocation ? (
                  <div>
                    <Title level={4}>{editIntegration.integration.allocation.spec.name}</Title>
                    <Text>{editIntegration.integration.allocation.spec.summary}</Text>
                  </div>
                ) : (
                  <Title level={4}>{editIntegration.integration.metadata.name}</Title>
                )
              }
              visible={!!editIntegration}
              onClose={this.clearEditIntegration}
              width={700}
            >
              {editIntegration.type === 'GKE' ?
                <GKECredentialsForm team={kore.koreAdminTeamName} allTeams={this.props.allTeams} data={editIntegration.integration} handleSubmit={this.handleEditIntegrationSave} />
                : null}
            </Drawer>
          ) : null}
          {addNewIntegration ? (
            <Drawer
              title={<Title level={4}>New {addNewIntegration} credentials</Title>}
              visible={!!addNewIntegration}
              onClose={this.clearAddNewIntegration}
              width={700}
            >
              {addNewIntegration === 'GKE' ?
                <GKECredentialsForm team={kore.koreAdminTeamName} allTeams={this.props.allTeams} handleSubmit={this.handleNewIntegrationSave} />
                : null}
            </Drawer>
          ) : null}
        </Card>
      </div>
    )
  }
}

export default ConfigureIntegrationsPage
