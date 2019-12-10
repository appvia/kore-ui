import * as React from 'react'
import apiRequest from '../../utils/api-request'
import canonical from '../../utils/canonical'
import Generic from '../../crd/Generic'
import { hub } from '../../../config'
import JSONSchemaForm from './JSONSchemaForm'
import { Typography, Select, Card, Form } from 'antd'

const { Paragraph, Text } = Typography

class ClusterProviderForm extends React.Component {
  state = {
    selectedProvider: false
  }

  handleSubmit = ({ requires }) => {
    return async (values, setState) => {
      const metaName = canonical(values.name)
      const resource = Generic({
        apiVersion: `${requires.group}/${requires.version}`,
        kind: requires.kind,
        name: metaName,
        spec: values
      })
      try {
        const response = await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${metaName}`, resource)
        // allocate this binding to all teams
        await apiRequest(null, 'put', `/teams/${hub.hubAdminTeamName}/bindings/${metaName}/allocation/allteams`)
        this.props.handleSubmit(response)
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

  onProviderChange = (value) => {
    const state = { ...this.state }
    const provider = this.props.classes.items.find(c => c.metadata.name === value)
    state.selectedProvider = provider
    this.setState(state)
  }

  render() {
    const ProviderForm = () => {
      if (this.state.selectedProvider) {
        const s = this.state.selectedProvider
        const requires = s.spec.requires
        const requiresSchema = s.spec.schemas.definitions[requires.kind].properties.spec
        return (
          <Card key={s.metadata.name} title={s.spec.displayName} style={{marginTop: '20px'}} headStyle={{backgroundColor: '#f5f5f5'}}>
            <Paragraph>
              <Text>Complete the form required for <Text strong>{s.spec.displayName}</Text></Text>
            </Paragraph>
            <JSONSchemaForm
              formConfig={{
                layout: 'horizontal',
                labelCol: { span: 24 },
                wrapperCol: { span: 24 }
              }}
              schema={requiresSchema}
              handleSubmit={this.handleSubmit({ requires })}
            />
          </Card>
        )
      }
      return null
    }

    return (
      <div>
        <Form.Item label="Cluster provider" required={true}>
          <Select
            placeholder="Select cluster provider"
            onChange={this.onProviderChange}
            style={{width: '100%'}}
          >
            {this.props.classes.items.map(c => (
              <Select.Option key={c.metadata.name} value={c.metadata.name}>{c.spec.displayName}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <ProviderForm />
      </div>
    )
  }
}

const WrappedClusterProviderForm = Form.create({ name: 'new_team' })(ClusterProviderForm)

export default WrappedClusterProviderForm
