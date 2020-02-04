import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Typography, Card, List, Button, Avatar, Icon, Drawer, message } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import copy from '../../lib/utils/object-copy'
import Breadcrumb from '../../lib/components/Breadcrumb'
import GKECredentialsForm from '../../lib/components/forms/GKECredentialsForm'

import { hub } from '../../config'

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

  static async getPageData(req) {
    const getTeams = () => apiRequest(req, 'get', '/teams')
    const getGKECredentials = () => apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/gkecredentials`)
    const getAllocations = () => apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/allocations`)

    return axios.all([getGKECredentials(), getTeams(), getAllocations()])
      .then(axios.spread(async function (gkeCredentials, allTeams, allAllocations) {
        allTeams.items = allTeams.items.filter(t => ![hub.hubAdminTeamName, hub.hubDefaultTeamName].includes(t.metadata.name))

        gkeCredentials.items.forEach(gke => {
          gke.allocation = allAllocations.items.find(alloc => alloc.metadata.name === gke.metadata.name)
        })

        return { gkeCredentials, allTeams }
      }))
      .catch(err => {
        throw new Error(err.message)
      })
  }

  static getInitialProps = async (ctx) => {
    const data = await ConfigureIntegrationsPage.getPageData(ctx.req)
    return {
      title: 'Configure integrations',
      ...data
    }
  }

  handleEditIntegrationSave = (updatedIntegration) => {
    const state = copy(this.state)

    const editedIntegration = state.gkeCredentials.items.find(c => c.metadata.name === state.editIntegration.integration.metadata.name)
    editedIntegration.spec = updatedIntegration.spec
    editedIntegration.allocation = updatedIntegration.allocation

    this.setState(state)
    this.clearEditIntegration()
    message.success('Integration updated')
  }

  editIntegration = (gkeCredentials) => {
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
    const getBindingAllocations = (allocation) => {
      const allocatedTeams = this.props.allTeams.items.filter(team => allocation.includes(team.metadata.name)).map(team => team.spec.summary)
      return allocatedTeams.length > 0 ? allocatedTeams.join(', ') : 'All teams'
    }

    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="GKE cluster providers" extra={<Button type="primary" onClick={this.addNewIntegration}>+ New</Button>}>
          <List
            dataSource={this.state.gkeCredentials.items}
            renderItem={gke =>
              <List.Item key={gke.metadata.name} actions={[<Text key="show_creds"><a onClick={this.editIntegration(gke)}><Icon type="eye" theme="filled"/> Edit</a></Text>]}>
                <List.Item.Meta
                  avatar={<Avatar icon="cloud" />}
                  title={<Text>{gke.allocation.spec.name} <Text type="secondary">{gke.allocation.spec.summary}</Text></Text>}
                  description={<span>Allocated to: {getBindingAllocations(gke.allocation.spec.teams)}</span>}
                />
              </List.Item>
            }
          >
          </List>
          {this.state.editIntegration ? (
            <Drawer
              title={
                <div>
                  <Title level={4}>{this.state.editIntegration.integration.allocation.spec.name}</Title>
                  <Text>{this.state.editIntegration.integration.allocation.spec.summary}</Text>
                </div>
              }
              visible={!!this.state.editIntegration}
              onClose={this.clearEditIntegration}
              width={700}
            >
              {this.state.editIntegration.type === 'GKE' ?
                <GKECredentialsForm team={hub.hubAdminTeamName} allTeams={this.props.allTeams} data={this.state.editIntegration.integration} handleSubmit={this.handleEditIntegrationSave} />
                : null}
            </Drawer>
          ) : null}
          {this.state.addNewIntegration ? (
            <Drawer
              title={<Title level={4}>New {this.state.addNewIntegration} provider</Title>}
              visible={!!this.state.addNewIntegration}
              onClose={this.clearAddNewIntegration}
              width={700}
            >
              {this.state.addNewIntegration === 'GKE' ?
                <GKECredentialsForm team={hub.hubAdminTeamName} allTeams={this.props.allTeams} handleSubmit={this.handleNewIntegrationSave} />
                : null}
            </Drawer>
          ) : null}
        </Card>
      </div>
    )
  }
}

export default ConfigureIntegrationsPage
