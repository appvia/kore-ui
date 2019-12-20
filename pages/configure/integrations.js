import React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Typography, Card, List, Button, Avatar, Tooltip, Icon, Drawer, message } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import asyncForEach from '../../lib/utils/async-foreach'
import copy from '../../lib/utils/object-copy'
import Breadcrumb from '../../lib/components/Breadcrumb'
import ClusterProviderForm from '../../lib/components/forms/ClusterProviderForm'

import { hub } from '../../config'

class ConfigureIntegrationsPage extends React.Component {
  static propTypes = {
    clusterClasses: PropTypes.array.isRequired,
    allTeams: PropTypes.object.isRequired
  }

  state = {
    clusterClasses: this.props.clusterClasses,
    editIntegration: false,
    addNewIntegration: false
  }

  static async getPageData(req) {
    const getClasses = () => apiRequest(req, 'get', '/classes')
    const getTeams = () => apiRequest(req, 'get', '/teams')
    const getBindings = () => apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings`)

    return axios.all([getClasses(), getTeams(), getBindings()])
      .then(axios.spread(async function (classes, allTeams, bindings) {
        const clusterClasses = classes.items.filter(c => c.spec.category === 'cluster')
        allTeams.items = allTeams.items.filter(t => t.metadata.name !== hub.hubAdminTeamName)

        const processBindings = async bindings => {
          await asyncForEach(bindings, async b => {
            const instance = await apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${b.metadata.name}`)
            instance.allocations = await apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${b.metadata.name}/allocation`)
            // eslint-disable-next-line require-atomic-updates
            b.instance = instance
          })
        }

        const processClasses = async classes => {
          await asyncForEach(classes, async c => {
            c.bindings = bindings.items.filter(b => b.spec.class.kind === 'Class' && b.spec.class.name === c.metadata.name)
            await processBindings(c.bindings)
          })
        }

        await processClasses(clusterClasses)
        return { clusterClasses, allTeams }
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

  handleEditIntegrationSave = (updatedBinding, updatedAllocations) => {
    const state = copy(this.state)
    const editedClass = state.clusterClasses.find(c => c.metadata.name === state.editIntegration.classMetadataName)
    const editedBinding = editedClass.bindings.find(b => b.metadata.name === state.editIntegration.binding.metadata.name)

    editedBinding.instance.spec = updatedBinding.spec
    editedBinding.instance.metadata = updatedBinding.metadata
    editedBinding.instance.allocations.items = updatedAllocations

    this.setState(state)
    this.clearEditIntegration()
    message.success('Integration updated')
  }

  editIntegration = (classMetadataName, className, binding) => {
    return async () => {
      const instanceClass = await apiRequest(null, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${binding.metadata.name}/class`)
      const classes = await apiRequest(null, 'get', '/classes?category=cluster')
      const bindingCopy = copy(binding)
      bindingCopy.instance.class = instanceClass
      const requires = bindingCopy.instance.class.spec.requires
      const requiresSchema = bindingCopy.instance.class.spec.schemas.definitions[requires.kind].properties.spec
      const state = copy(this.state)
      state.editIntegration = { classMetadataName, className, binding: bindingCopy, requires, requiresSchema, classes, teams: this.props.allTeams }
      this.setState(state)
    }
  }

  clearEditIntegration = () => {
    const state = copy(this.state)
    state.editIntegration = false
    this.setState(state)
  }

  addNewIntegration = () => {
    return async () => {
      const classes = await apiRequest(null, 'get', '/classes?category=cluster')
      const state = copy(this.state)
      state.addNewIntegration = { classes, teams: this.props.allTeams }
      this.setState(state)
    }
  }

  clearAddNewIntegration = () => {
    const state = copy(this.state)
    state.addNewIntegration = false
    this.setState(state)
  }

  handleNewIntegrationSave = async (createdBinding, createdAllocations) => {
    const allBindings = await apiRequest(null, 'get', `/teams/${hub.hubAdminTeamName}/bindings`)
    const newBindingWrapper = allBindings.items.find(b => b.metadata.name === createdBinding.metadata.name)
    newBindingWrapper.instance = createdBinding
    newBindingWrapper.instance.allocations = { items: createdAllocations }
    const state = copy(this.state)
    state.clusterClasses.map(c => {
      if (c.metadata.name === newBindingWrapper.spec.class.name) {
        c.bindings.push(newBindingWrapper)
      }
      return c
    })

    state.addNewIntegration = false
    this.setState(state)
    message.success('Integration created')
  }

  render() {
    const getBindingAllocations = (allocations) => {
      const allocatedTeams = this.props.allTeams.items.filter(team => allocations.includes(team.metadata.name)).map(team => team.spec.summary)
      return allocatedTeams.length > 0 ? allocatedTeams.join(', ') : 'All teams'
    }

    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="Cloud cluster providers" extra={<Button type="primary" onClick={this.addNewIntegration()}>+ New</Button>}>
          <List
            dataSource={this.state.clusterClasses.filter(c => c.bindings.length > 0)}
            renderItem={c => c.bindings.map(b => (
              <List.Item key={b.metadata.name} actions={[<Text key="show_creds"><a onClick={this.editIntegration(c.metadata.name, c.spec.displayName, b)}><Icon type="eye" theme="filled"/> Edit</a></Text>]}>
                <List.Item.Meta
                  avatar={<Avatar icon="cloud" />}
                  title={<Text>{c.spec.displayName} <Tooltip title={c.spec.description}><Icon type="info-circle" /></Tooltip> <Text type="secondary">{b.instance.spec.name}</Text></Text>}
                  description={<span>Allocated to: {getBindingAllocations(b.instance.allocations.items)}</span>}
                />
              </List.Item>
            ))}
          >
          </List>
          {this.state.editIntegration ? (
            <Drawer
              title={
                <div>
                  <Title level={4}>{this.state.editIntegration.className}</Title>
                  <Text>{this.state.editIntegration.binding.instance.spec.name}</Text>
                </div>
              }
              visible={!!this.state.editIntegration}
              onClose={this.clearEditIntegration}
              width={700}
            >
              <ClusterProviderForm
                mode="edit"
                jsonSchemaFormData={this.state.editIntegration.binding.instance.spec}
                selectedProvider={this.state.editIntegration.binding.spec.class.name}
                bindingInstance={this.state.editIntegration.binding.instance}
                classes={this.state.editIntegration.classes}
                teams={this.state.editIntegration.teams}
                handleSubmit={this.handleEditIntegrationSave}/>
            </Drawer>
          ) : null}
          {this.state.addNewIntegration ? (
            <Drawer
              title={<Title level={4}>New cloud cluster provider</Title>}
              visible={!!this.state.addNewIntegration}
              onClose={this.clearAddNewIntegration}
              width={700}
            >
              <ClusterProviderForm
                mode="new"
                classes={this.state.addNewIntegration.classes}
                teams={this.state.addNewIntegration.teams}
                handleSubmit={this.handleNewIntegrationSave}
              />
            </Drawer>
          ) : null}
        </Card>
      </div>
    )
  }
}

export default ConfigureIntegrationsPage
