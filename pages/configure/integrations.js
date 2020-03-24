import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Typography, Card, List, Button, Drawer, message } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import apiPaths from '../../lib/utils/api-paths'
import copy from '../../lib/utils/object-copy'
import Breadcrumb from '../../lib/components/Breadcrumb'
import Credentials from '../../lib/components/team/Credentials'
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
    const getTeams = () => apiRequest({ req, res }, 'get', apiPaths.teams)
    const getGKECredentials = () => apiRequest({ req, res }, 'get', apiPaths.team(kore.koreAdminTeamName).gkeCredentials)
    const getAllocations = () => apiRequest({ req, res }, 'get',apiPaths.team(kore.koreAdminTeamName).allocations)

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

  handleUpdated = resourceType => {
    return (updatedResource, done) => {
      const state = copy(this.state)
      const resource = state[resourceType].items.find(r => r.metadata.name === updatedResource.metadata.name)
      resource.status = updatedResource.status
      this.setState(state, done)
    }
  }

  handleEditIntegrationSave = updatedIntegration => {
    const state = copy(this.state)

    const editedIntegration = state.gkeCredentials.items.find(c => c.metadata.name === state.editIntegration.integration.metadata.name)
    editedIntegration.spec = updatedIntegration.spec
    editedIntegration.allocation = updatedIntegration.allocation
    editedIntegration.status.status = 'Pending'

    this.setState(state)
    this.clearEditIntegration()
    message.success('GKE credentials updated successfully')
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
    message.success('GKE credentials created successfully')
  }

  render() {
    const { gkeCredentials, editIntegration, addNewIntegration } = this.state
    const { allTeams } = this.props

    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="GKE credentials" extra={<Button type="primary" onClick={this.addNewIntegration}>+ New</Button>}>
          <List
            dataSource={gkeCredentials.items}
            renderItem={gke =>
              <Credentials
                gke={gke}
                allTeams={allTeams.items}
                editGKECredential={this.editIntegration}
                handleUpdate={this.handleUpdated('gkeCredentials')}
                refreshMs={2000}
                stateResourceDataKey="gke"
                resourceApiPath={`/teams/${kore.koreAdminTeamName}/gkecredentials/${gke.metadata.name}`}
              />
            }
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
                <GKECredentialsForm team={kore.koreAdminTeamName} allTeams={allTeams} data={editIntegration.integration} handleSubmit={this.handleEditIntegrationSave} />
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
                <GKECredentialsForm team={kore.koreAdminTeamName} allTeams={allTeams} handleSubmit={this.handleNewIntegrationSave} />
                : null}
            </Drawer>
          ) : null}
        </Card>
      </div>
    )
  }
}

export default ConfigureIntegrationsPage
