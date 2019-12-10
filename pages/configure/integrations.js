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
            const [instance, instanceClass] = await Promise.all([
              apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${b.metadata.name}`),
              apiRequest(req, 'get', `/teams/${hub.hubAdminTeamName}/bindings/${b.metadata.name}/class`)
            ])
            b.instance = instance
            b.instance.class = instanceClass
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
        const newBinding = await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${currentBinding.class.metadata.name}`,  bindingToPut)
        currentBinding.spec = newBinding.spec
        currentBinding.metadata = newBinding.metadata
        this.cancelEditIntegration()
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

  handleEditIntegrationCancel = () => {
    this.cancelEditIntegration()
  }

  editIntegration = (className, binding) => {
    return () => {
      const state = { ...this.state }
      const requires = binding.instance.class.spec.requires
      const requiresSchema = binding.instance.class.spec.schemas.definitions[requires.kind].properties.spec
      state.editIntegration = { className, binding, requires, requiresSchema }
      this.setState(state)
    }
  }

  cancelEditIntegration = () => {
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

  cancelAddNewIntegration = () => {
    const state = { ...this.state }
    state.addNewIntegration = false
    this.setState(state)
  }

  handleNewIntegrationSave = () => {
    console.log('handleNewIntegrationSave')
    this.cancelAddNewIntegration()
  }

  render() {
    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="Cloud cluster providers" extra={<Button type="primary" onClick={this.addNewIntegration()}>+ New</Button>}>
          <List
            dataSource={this.props.clusterClasses}
            renderItem={c => c.bindings.map(b => (
              <List.Item actions={[<Text><a key="show_creds" onClick={this.editIntegration(c.spec.displayName, b)}><Icon type="eye" theme="filled"/> Edit</a></Text>]}>
                <List.Item.Meta
                  avatar={<Avatar icon="cloud" />}
                  title={<Text>{c.spec.displayName} <Tooltip title={c.spec.description}><Icon type="info-circle" /></Tooltip></Text>}
                  description={<span>{b.metadata.name}</span>}
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
              onClose={this.cancelEditIntegration}
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
                handleCancel={this.handleEditIntegrationCancel}
              />
            </Drawer>
          ) : null}
          {this.state.addNewIntegration ? (
            <Drawer
              title={<Title level={4}>New cloud cluster provider</Title>}
              visible={!!this.state.addNewIntegration}
              onClose={this.cancelAddNewIntegration}
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
