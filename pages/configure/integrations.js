import React from 'react'
import axios from 'axios'
import { Typography, Card, List, Button, Avatar, Tooltip, Icon, Modal, message } from 'antd'
const { Text, Title } = Typography

import apiRequest from '../../lib/utils/api-request'
import asyncForEach from '../../lib/utils/async-foreach'
import Breadcrumb from '../../lib/components/Breadcrumb'
import JSONSchemaForm from '../../lib/components/forms/JSONSchemaForm'

import { hub } from '../../config'

class ConfigureIntegrationsPage extends React.Component {
  state = {
    showHideBindingData: false
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

  handleFormSubmit = ({ currentBinding }) => {
    return async (values, setState) => {
      const bindingToPut = { ...currentBinding }
      bindingToPut.spec = values
      delete bindingToPut.class
      try {
        const newBinding = await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${currentBinding.class.metadata.name}`,  bindingToPut)
        currentBinding.spec = newBinding.spec
        currentBinding.metadata = newBinding.metadata
        this.clearShowHideBindingData()
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

  showHideBindingData = (className, binding) => {
    return () => {
      const state = { ...state }
      const requires = binding.instance.class.spec.requires
      const requiresSchema = binding.instance.class.spec.schemas.definitions[requires.kind].properties.spec
      state.showHideBindingData = { className, binding, requires, requiresSchema }
      this.setState(state)
    }
  }

  clearShowHideBindingData = () => {
    const state = { ...state }
    state.showHideBindingData = false
    this.setState(state)
  }

  render() {
    return (
      <div>
        <Breadcrumb items={[{text: 'Configure'}, {text: 'Integrations'}]} />
        <Card title="Cloud cluster providers" extra={<Button type="primary"><a href="/1/new-integration-provider">+ New</a></Button>}>
          <List
            dataSource={this.props.clusterClasses}
            renderItem={c => c.bindings.map(b => (
              <List.Item actions={[<Text><a key="show_creds" onClick={this.showHideBindingData(c.spec.displayName, b)}><Icon type="eye" theme="filled"/> Edit</a></Text>]}>
                <List.Item.Meta
                  avatar={<Avatar icon="cloud" />}
                  title={<Text>{c.spec.displayName} <Tooltip title={c.spec.description}><Icon type="info-circle" /></Tooltip></Text>}
                  description={<span>{b.metadata.name}</span>}
                />
              </List.Item>
            ))}
          >
          </List>
          {this.state.showHideBindingData ? (
            <Modal
              title={
                <div>
                  <Title level={4}>{this.state.showHideBindingData.className}</Title>
                  <Text>{this.state.showHideBindingData.binding.metadata.name}</Text>
                </div>
              }
              visible={!!this.state.showHideBindingData}
              onOk={this.clearShowHideBindingData}
              onCancel={this.clearShowHideBindingData}
              width={700}
            >
              <JSONSchemaForm
                formConfig={{
                  layout: 'horizontal',
                  labelCol: { span: 24 },
                  wrapperCol: { span: 24 }
                }}
                schema={this.state.showHideBindingData.requiresSchema}
                formData={this.state.showHideBindingData.binding.instance.spec}
                handleSubmit={this.handleFormSubmit({ currentBinding: this.state.showHideBindingData.binding.instance })}
              />
            </Modal>
          ) : null}
        </Card>
      </div>
    )
  }
}

export default ConfigureIntegrationsPage
