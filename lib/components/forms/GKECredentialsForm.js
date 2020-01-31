import * as React from 'react'
import PropTypes from 'prop-types'
import copy from '../../utils/object-copy'
import canonical from '../../utils/canonical'
import GKECredentials from '../../crd/GKECredentials'
import Allocation from '../../crd/Allocation'
import apiRequest from '../../utils/api-request'
import { Button, Form, Input, Alert } from 'antd'

class GKECredentialsForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    team: PropTypes.string.isRequired,
    handleSubmit: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      submitting: false,
      formErrorMessage: false,
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

  handleSubmit = e => {
    e.preventDefault()

    const state = copy(this.state)
    state.submitting = true
    state.formErrorMessage = false
    this.setState(state)

    return this.props.form.validateFields(async (err, values) => {
      if (!err) {
        try {
          const canonicalName = canonical(values.name)
          const gkeCredsResource = GKECredentials(canonicalName, values)
          await apiRequest(null, 'put', `/teams/${this.props.team}/gkecredentials/${canonicalName}`, gkeCredsResource)
          const [ group, version ] = gkeCredsResource.apiVersion.split('/')
          const allocationSpec = {
            name: values.name,
            summary: values.name,
            resource: {
              group,
              version,
              kind: gkeCredsResource.kind,
              namespace: this.props.team,
              name: canonicalName
            },
            teams: ['*']
          }
          await apiRequest(null, 'put', `/teams/${this.props.team}/allocations/${canonicalName}`, Allocation(canonicalName, allocationSpec))
          await this.props.handleSubmit()
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
    console.log('this.props.team', this.props.team)
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
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
    const accountJSONError = isFieldTouched('accountJSON') && getFieldError('accountJSON')
    const projectError = isFieldTouched('project') && getFieldError('project')
    const regionError = isFieldTouched('region') && getFieldError('region')

    const formErrorMessage = () => {
      if (this.state.formErrorMessage) {
        return (
          <Alert
            message={this.state.formErrorMessage}
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
      <Form {...formConfig} onSubmit={this.handleSubmit} style={{ marginBottom: '30px' }}>
        <div>{formErrorMessage()}</div>
        <Form.Item label="Name" validateStatus={nameError ? 'error' : ''} help={nameError || ''}>
          {getFieldDecorator('name', {
            rules: [{ required: true, message: 'Please enter the name!' }],
          })(
            <Input placeholder="Name" />,
          )}
        </Form.Item>
        <Form.Item label="Account JSON" validateStatus={accountJSONError ? 'error' : ''} help={accountJSONError || ''}>
          {getFieldDecorator('account', {
            rules: [{ required: true, message: 'Please enter your account JSON!' }],
          })(
            <Input.TextArea autoSize={{ minRows: 4, maxRows: 10  }} placeholder="Account JSON" />,
          )}
        </Form.Item>
        <Form.Item label="Project" validateStatus={projectError ? 'error' : ''} help={projectError || ''}>
          {getFieldDecorator('project', {
            rules: [{ required: true, message: 'Please enter your project!' }],
          })(
            <Input placeholder="Project" />,
          )}
        </Form.Item>
        <Form.Item label="Region" validateStatus={regionError ? 'error' : ''} help={regionError || ''}>
          {getFieldDecorator('region', {
            rules: [{ required: true, message: 'Please enter your region!' }],
          })(
            <Input placeholder="Region" />,
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: '0'}}>
          <Button type="primary" htmlType="submit" loading={this.state.submitting} disabled={this.disableButton(getFieldsError())}>Save</Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedGKECredentialsForm = Form.create({ name: 'gke_credentials' })(GKECredentialsForm)

export default WrappedGKECredentialsForm
