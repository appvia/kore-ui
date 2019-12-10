import React from 'react'
import axios from 'axios'
import { Typography, Card, List, Button, Avatar, Tooltip, Icon, Drawer, message } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import asyncForEach from '../../lib/utils/async-foreach'
import Breadcrumb from '../../lib/components/Breadcrumb'
import ClusterProviderForm from '../../lib/components/forms/ClusterProviderForm'
import JSONSchemaForm from '../../lib/components/forms/JSONSchemaForm'

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

  handleEditIntegrationSave = ({ currentBinding }) => {
    return async (values, setState) => {
      const bindingToPut = { ...currentBinding }
      bindingToPut.spec = values
      delete bindingToPut.class
      try {
        const newBinding = await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${currentBinding.metadata.name}`,  bindingToPut)
        currentBinding.spec = newBinding.spec
        currentBinding.metadata = newBinding.metadata
        this.clearEditIntegration()
        message.success('Integration updated')
      } catch (err) {
        console.error('Error submitting form', err)
        const state = { ...this.state }
        state.buttonText = 'Save'
        state.submitting = false
        state.formErrorMessage = 'An error occurred saving the configuration, please try again'
        setState(state)
      }
    }
  }

  editIntegration = (className, binding) => {
    return async () => {
      const instanceClass = await apiRequest(null, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${binding.metadata.name}/class`)
      binding.instance.class = instanceClass
      const state = { ...this.state }
      const requires = binding.instance.class.spec.requires
      const requiresSchema = binding.instance.class.spec.schemas.definitions[requires.kind].properties.spec
      state.editIntegration = { className, binding, requires, requiresSchema }
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
      const state = { ...this.state }
      state.addNewIntegration = {
        classes
      }
      console.log('state', state)
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
    console.log('this.state.clusterClasses', this.state.clusterClasses)
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
                  <Text>{this.state.editIntegration.binding.metadata.name}</Text>
                </div>
              }
              visible={!!this.state.editIntegration}
              onClose={this.clearEditIntegration}
              width={700}
            >
              <JSONSchemaForm
                formConfig={{
                  layout: 'horizontal',
                  labelCol: { span: 24 },
                  wrapperCol: { span: 24 }
                }}
                schema={this.state.editIntegration.requiresSchema}
                formData={this.state.editIntegration.binding.instance.spec}
                handleSubmit={this.handleEditIntegrationSave({ currentBinding: this.state.editIntegration.binding.instance })}
                handleCancel={this.clearEditIntegration}
              />
            </Drawer>
          ) : null}
          {this.state.addNewIntegration ? (
            <Drawer
              title={<Title level={4}>New cloud cluster provider</Title>}
              visible={!!this.state.addNewIntegration}
              onClose={this.clearAddNewIntegration}
              width={700}
            >
              <ClusterProviderForm classes={this.state.addNewIntegration.classes} handleSubmit={this.handleNewIntegrationSave}/>
            </Drawer>
          ) : null}
        </Card>
      </div>
    )
  }
}

export default ConfigureIntegrationsPage
