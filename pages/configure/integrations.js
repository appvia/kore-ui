import React from 'react'
import axios from 'axios'
import { Typography, Card, List, Button, Avatar, Tooltip, Icon, Drawer, message } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import asyncForEach from '../../lib/utils/async-foreach'
import Breadcrumb from '../../lib/components/Breadcrumb'
import ClusterProviderForm from '../../lib/components/forms/ClusterProviderForm'

import { hub } from '../../config'

class ConfigureIntegrationsPage extends React.Component {
  state = {
    clusterClasses: this.props.clusterClasses,
    editIntegration: false,
    addNewIntegration: false
  }

  static async getPageData(req) {
    const getClasses = () => apiRequest(req, 'get', '/classes')
    const getBindings = () => apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings`)

    return axios.all([getClasses(), getBindings()])
      .then(axios.spread(async function (classes, bindings) {
        const clusterClasses = classes.items.filter(c => c.spec.category === 'cluster')

        const processBindings = async bindings => {
          await asyncForEach(bindings, async b => {
            b.instance = await apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${b.metadata.name}`)
          })
        }

        const processClasses = async classes => {
          await asyncForEach(classes, async c => {
            c.bindings = bindings.items.filter(b => b.spec.class.kind === 'Class' && b.spec.class.name === c.metadata.name)
            await processBindings(c.bindings)
          })
        }

        await processClasses(clusterClasses)
        return { clusterClasses }
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

  handleEditIntegrationSave = (updatedBinding) => {
    const currentBinding = this.state.editIntegration.binding.instance
    currentBinding.spec = updatedBinding.spec
    currentBinding.metadata = updatedBinding.metadata
    this.clearEditIntegration()
    message.success('Integration updated')
  }

  editIntegration = (className, binding) => {
    return async () => {
      const instanceClass = await apiRequest(null, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${binding.metadata.name}/class`)
      const allocations = await apiRequest(null, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${binding.metadata.name}/allocation`)
      const classes = await apiRequest(null, 'get', '/classes?category=cluster')
      const teams = await apiRequest(null, 'get', '/teams')
      binding.instance.class = instanceClass
      binding.instance.allocations = allocations.items
      const state = { ...this.state }
      const requires = binding.instance.class.spec.requires
      const requiresSchema = binding.instance.class.spec.schemas.definitions[requires.kind].properties.spec
      state.editIntegration = { className, binding, requires, requiresSchema, classes, teams }
      this.setState(state)
    }
  }

  clearEditIntegration = () => {
    const state = { ...this.state }
    state.editIntegration = false
    this.setState(state)
  }

  addNewIntegration = () => {
    return async () => {
      const classes = await apiRequest(null, 'get', '/classes?category=cluster')
      const teams = await apiRequest(null, 'get', '/teams')
      const state = { ...this.state }
      state.addNewIntegration = { classes, teams }
      this.setState(state)
    }
  }

  clearAddNewIntegration = () => {
    const state = { ...this.state }
    state.addNewIntegration = false
    this.setState(state)
  }

  handleNewIntegrationSave = async (createdBinding) => {
    const allBindings = await apiRequest(null, 'get', `/teams/${hub.hubAdminTeamName}/bindings`)
    const newBindingWrapper = allBindings.items.find(b => b.metadata.name === createdBinding.metadata.name)
    newBindingWrapper.instance = createdBinding
    const state = { ...this.state }
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
    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="Cloud cluster providers" extra={<Button type="primary" onClick={this.addNewIntegration()}>+ New</Button>}>
          <List
            dataSource={this.state.clusterClasses}
            renderItem={c => c.bindings.map(b => (
              <List.Item key={b.metadata.name} actions={[<Text><a key="show_creds" onClick={this.editIntegration(c.spec.displayName, b)}><Icon type="eye" theme="filled"/> Edit</a></Text>]}>
                <List.Item.Meta
                  avatar={<Avatar icon="cloud" />}
                  title={<Text>{c.spec.displayName} <Tooltip title={c.spec.description}><Icon type="info-circle" /></Tooltip></Text>}
                  description={<span>{b.instance.spec.name}</span>}
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
