import * as React from 'react'
import PropTypes from 'prop-types'
import copy from '../../utils/object-copy'
import canonical from '../../utils/canonical'
import GKECredentials from '../../crd/GKECredentials'
import Allocation from '../../crd/Allocation'
import apiRequest from '../../utils/api-request'
import { Button, Form, Input, Alert, Select } from 'antd'

class GKECredentialsForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    team: PropTypes.string.isRequired,
    allTeams: PropTypes.object,
    data: PropTypes.object,
    handleSubmit: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    let allocations = []
    if (props.data && props.data.allocation) {
      allocations = props.data.allocation.spec.teams.filter(a => a !== '*')
    }
    this.state = {
      submitting: false,
      formErrorMessage: false,
      allocations
    }
  }

  componentDidMount() {
    // To disabled submit button at the beginning.
    this.props.form.validateFields()
  }

  disableButton = fieldsError => {
    if (this.state.submitting) {
      return true
    }
    return Object.keys(fieldsError).some(field => fieldsError[field])
  }

  onAllocationsChange = value => {
    const state = copy(this.state)
    state.allocations = value
    this.setState(state)
  }

  handleSubmit = e => {
    e.preventDefault()

    const state = copy(this.state)
    state.submitting = true
    state.formErrorMessage = false
    this.setState(state)

    return this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          const data = this.props.data
          const canonicalName = (data && data.metadata && data.metadata.name) || canonical(values.name)
          const gkeCredsResource = GKECredentials(canonicalName, values)
          const gkeResult = await apiRequest(null, 'put', `/teams/${this.props.team}/gkecredentials/${canonicalName}`, gkeCredsResource)
          const [ group, version ] = gkeCredsResource.apiVersion.split('/')
          const allocationSpec = {
            name: values.name,
            summary: values.summary,
            resource: {
              group,
              version,
              kind: gkeCredsResource.kind,
              namespace: this.props.team,
              name: canonicalName
            },
            teams: this.state.allocations.length > 0 ? this.state.allocations : ['*']
          }
          const allocationResult = await apiRequest(null, 'put', `/teams/${this.props.team}/allocations/${canonicalName}`, Allocation(canonicalName, allocationSpec))
          gkeResult.allocation = allocationResult
          await this.props.handleSubmit(gkeResult)
        } catch (err) {
          console.error('Error submitting form', err)
          const state = copy(this.state)
          state.submitting = false
          state.formErrorMessage = 'An error occurred saving the credentials, please try again'
          this.setState(state)
        }
      }
    })
  }

  render() {
    const { form, data, allTeams } = this.props
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = form
    const { formErrorMessage, allocations, submitting } = this.state
    const formConfig = {
      layout: 'horizontal',
      labelAlign: 'left',
      hideRequiredMark: true,
      labelCol: {
        sm: { span: 24 },
        md: { span: 6 },
        lg: { span: 4 }
      },
      wrapperCol: {
        span: 12
      }
    }

    // Only show error after a field is touched.
    const nameError = isFieldTouched('name') && getFieldError('name')
    const summaryError = isFieldTouched('summary') && getFieldError('summary')
    const accountJSONError = isFieldTouched('accountJSON') && getFieldError('accountJSON')
    const projectError = isFieldTouched('project') && getFieldError('project')
    const regionError = isFieldTouched('region') && getFieldError('region')

    const allocationMissing = Boolean(data && !data.allocation)

    const FormErrorMessage = () => {
      if (formErrorMessage) {
        return (
          <Alert
            message={formErrorMessage}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '20px'}}
          />
        )
      }
      return null
    }

    return (
      <div>

        {allocationMissing ? (
          <Alert
            message="These credentials are not allocated to any teams"
            description="Enter Allocated team(s), Name and Description below and click Save to allocate these Credentials."
            type="warning"
            showIcon
            style={{ marginBottom: '20px'}}
          />
        ) : null}

        {allocations ? (
          <Form>
            <Form.Item label="Allocate team(s)" extra="If nothing selected then this integration will be available to ALL teams">
              {getFieldDecorator('allocations', { initialValue: allocations })(
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder={allocationMissing ? 'No teams' : 'All teams'}
                  onChange={this.onAllocationsChange}
                >
                  {allTeams.items.map(t => (
                    <Select.Option key={t.metadata.name} value={t.metadata.name}>{t.spec.summary}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Form>
        ) : null}

        <Form {...formConfig} onSubmit={this.handleSubmit}>
          <FormErrorMessage />
          <Form.Item label="Name" validateStatus={nameError ? 'error' : ''} help={nameError || 'The name for your credentials eg. MyOrg GKE'}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: 'Please enter the name!' }],
              initialValue: data && data.allocation && data.allocation.spec.name
            })(
              <Input placeholder="Name" />,
            )}
          </Form.Item>
          <Form.Item label="Description" validateStatus={summaryError ? 'error' : ''} help={summaryError || 'A description of your credentials to help when choosing between them'}>
            {getFieldDecorator('summary', {
              rules: [{ required: true, message: 'Please enter the description!' }],
              initialValue: data && data.allocation && data.allocation.spec.summary
            })(
              <Input placeholder="Description" />,
            )}
          </Form.Item>
          <Form.Item label="Account JSON" validateStatus={accountJSONError ? 'error' : ''} help={accountJSONError || 'The Service Account JSON with GKE admin permissions on the GCP project'}>
            {getFieldDecorator('account', {
              rules: [{ required: true, message: 'Please enter your account JSON!' }],
              initialValue: data && data.spec.account
            })(
              <Input.TextArea autoSize={{ minRows: 4, maxRows: 10  }} placeholder="Account JSON" />,
            )}
          </Form.Item>
          <Form.Item label="Project" validateStatus={projectError ? 'error' : ''} help={projectError || 'The GCP project the cluster will be built in'}>
            {getFieldDecorator('project', {
              rules: [{ required: true, message: 'Please enter your project!' }],
              initialValue: data && data.spec.project
            })(
              <Input placeholder="Project" />,
            )}
          </Form.Item>
          <Form.Item label="Region" validateStatus={regionError ? 'error' : ''} help={regionError || 'The region the cluster will be built in'}>
            {getFieldDecorator('region', {
              rules: [{ required: true, message: 'Please enter your region!' }],
              initialValue: data && data.spec.region
            })(
              <Input placeholder="Region" />,
            )}
          </Form.Item>
          <Form.Item style={{ marginBottom: '0'}}>
            <Button type="primary" htmlType="submit" loading={submitting} disabled={this.disableButton(getFieldsError())}>Save</Button>
          </Form.Item>
        </Form>
      </div>
    )
  }
}

const WrappedGKECredentialsForm = Form.create({ name: 'gke_credentials' })(GKECredentialsForm)

export default WrappedGKECredentialsForm
