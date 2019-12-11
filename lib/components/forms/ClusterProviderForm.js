import * as React from 'react'
import apiRequest from '../../utils/api-request'
import asyncForEach from '../../utils/async-foreach'
import canonical from '../../utils/canonical'
import Generic from '../../crd/Generic'
import { hub } from '../../../config'
import JSONSchemaForm from './JSONSchemaForm'
import { Typography, Select, Card, Form } from 'antd'

const { Paragraph, Text } = Typography

class ClusterProviderForm extends React.Component {

  constructor(props) {
    super(props)
    const allocations = (this.props.bindingInstance && this.props.bindingInstance.allocations.items) || []
    this.state = {
      selectedProvider: this.props.classes.items.find(c => c.metadata.name === this.props.selectedProvider),
      allocations: allocations.filter(a => a !== '*'),
      currentAllocations: allocations
    }
  }

  saveUpdatedIntegration = async (newSpec) => {
    const currentBinding = this.props.bindingInstance
    const bindingToPut = { ...currentBinding }
    bindingToPut.spec = newSpec
    delete bindingToPut.class
    return await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${currentBinding.metadata.name}`, bindingToPut)
  }

  saveNewIntegration = async (requires, spec) => {
    const metaName = canonical(spec.name)
    const resource = Generic({
      apiVersion: `${requires.group}/${requires.version}`,
      kind: requires.kind,
      name: metaName,
      spec
    })
    return await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${metaName}`, resource)
  }

  saveAllocations = async (newAllocations, bindingName) => {
    // delete all allocations first
    if (this.props.mode === 'edit') {
      await apiRequest(null, 'delete', `/teams/${hub.hubAdminTeamName}/bindings/${bindingName}/allocation`)
      // purposeful wait to prevent race conditions that occur when trying to put new allocations before deletion is complete
      await new Promise(r => setTimeout(r, 2000))
    }
    const forAddition = newAllocations.length > 0 ? newAllocations : ['allteams']
    await asyncForEach(forAddition, async team => {
      await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${bindingName}/allocation/${team}`)
      // purposeful wait to prevent race conditions that occur when trying to put new allocations before deletion is complete
      await new Promise(r => setTimeout(r, 2000))
    })
  }

  handleSubmit = ({ requires }) => {
    return async (values, setState) => {
      try {
        if (this.props.mode === 'edit') {
          const newBinding = await this.saveUpdatedIntegration(values)
          const bindingName =  this.props.bindingInstance.metadata.name
          // don't wait for this to complete, it can work in the background
          this.saveAllocations(this.state.allocations, bindingName)
          this.props.handleSubmit(newBinding, this.state.allocations)
        } else {
          const response = await this.saveNewIntegration(requires, values)
          const bindingName = canonical(values.name)
          // don't wait for this to complete, it can work in the background
          this.saveAllocations(this.state.allocations, bindingName)
          this.props.handleSubmit(response, this.state.allocations)
        }
      } catch (err) {
        console.error('Error submitting form', err)
        const state = {...this.state}
        state.buttonText = 'Save'
        state.submitting = false
        state.formErrorMessage = 'An error occurred saving the configuration, please try again'
        setState(state)
      }
    }
  }

  onProviderChange = value => {
    const state = { ...this.state }
    const provider = this.props.classes.items.find(c => c.metadata.name === value)
    state.selectedProvider = provider
    this.setState(state)
  }

  onAllocationsChange = value => {
    const state = { ...this.state }
    state.allocations = value
    this.setState(state)
  }

  render() {
    const { getFieldDecorator } = this.props.form
    const mode = this.props.mode || 'new'

    const ProviderForm = () => {
      if (this.state.selectedProvider) {
        const s = this.state.selectedProvider
        const requires = s.spec.requires
        const requiresSchema = s.spec.schemas.definitions[requires.kind].properties.spec
        return (
          <Card key={s.metadata.name} title={s.spec.displayName} style={{marginTop: '20px'}} headStyle={{backgroundColor: '#f5f5f5'}}>
            {this.props.teams.items.length > 0 ? (
              <Form>
                <Form.Item label="Allocate team(s)" extra="If nothing selected then this integration will be available to ALL teams">
                  {getFieldDecorator('allocations', { initialValue: this.state.allocations })(
                    <Select
                      mode="multiple"
                      style={{width: '100%'}}
                      placeholder="All teams"
                      onChange={this.onAllocationsChange}
                    >
                      {this.props.teams.items.map(t => (
                        <Select.Option key={t.metadata.name} value={t.metadata.name}>{t.spec.summary}</Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Form>
            ) : null}
            <JSONSchemaForm
              formConfig={{
                layout: 'horizontal',
                labelCol: { span: 24 },
                wrapperCol: { span: 24 }
              }}
              schema={requiresSchema}
              formData={this.props.jsonSchemaFormData}
              handleSubmit={this.handleSubmit({ requires })}
            />
          </Card>
        )
      }
      return null
    }

    return (
      <div>
        <Form>
          {mode === 'new' ? (
            <Form.Item label="Cluster provider" required={true}>
              {getFieldDecorator('clusterProvider')(
                <Select
                  placeholder="Select cluster provider"
                  onChange={this.onProviderChange}
                  style={{width: '100%'}}
                >
                  {this.props.classes.items.map(c => (
                    <Select.Option key={c.metadata.name} value={c.metadata.name}>{c.spec.displayName}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : null}
        </Form>
        <ProviderForm />
      </div>
    )
  }
}

const WrappedClusterProviderForm = Form.create({ name: 'cluster_provider' })(ClusterProviderForm)

export default WrappedClusterProviderForm
