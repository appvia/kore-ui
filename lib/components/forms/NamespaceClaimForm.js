import * as React from 'react'
import PropTypes from 'prop-types'
import copy from '../../utils/object-copy'
import Generic from '../../crd/Generic'
import apiRequest from '../../utils/api-request'
import apiPaths from '../../utils/api-paths'
import { Button, Form, Input, Alert, Select } from 'antd'

class NamespaceClaimForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    team: PropTypes.string.isRequired,
    clusters: PropTypes.object.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired
  }

  state = {
    submitting: false,
    formErrorMessage: false
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

  cancel = () => {
    this.props.form.resetFields()
    this.props.handleCancel()
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
          const cluster = this.props.clusters.items.find(c => c.metadata.name === values.cluster)
          const name = values.name
          const resourceName = `${cluster.metadata.name}-${name}`

          const existingNc = await apiRequest(null, 'get', `${apiPaths.team(this.props.team).namespaceClaims}/${resourceName}`)
          if (Object.keys(existingNc).length) {
            const state = copy(this.state)
            state.submitting = false
            state.formErrorMessage = `A namespace with the name "${name}" already exists on cluster "${cluster.metadata.name}"`
            return this.setState(state)
          }

          const [ group, version ] = cluster.apiVersion.split('/')
          const spec = {
            name,
            cluster: {
              group,
              version,
              kind: cluster.kind,
              name: cluster.metadata.name,
              namespace: this.props.team
            }
          }
          const nsClaimResource = Generic({
            apiVersion: 'namespaceclaims.clusters.compute.kore.appvia.io/v1alpha1',
            kind: 'NamespaceClaim',
            name: resourceName,
            spec
          })
          const nsClaimResult = await apiRequest(null, 'put', `${apiPaths.team(this.props.team).namespaceClaims}/${resourceName}`, nsClaimResource)
          this.props.form.resetFields()
          const state = copy(this.state)
          state.submitting = false
          this.setState(state)
          await this.props.handleSubmit(nsClaimResult)
        } catch (err) {
          console.error('Error submitting form', err)
          const state = copy(this.state)
          state.submitting = false
          state.formErrorMessage = 'An error occurred creating the namespace, please try again'
          this.setState(state)
        }
      }
    })
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form
    const { clusters } = this.props
    const { submitting, formErrorMessage } = this.state
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
    const clusterError = isFieldTouched('cluster') && getFieldError('cluster')

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
      <Form {...formConfig} onSubmit={this.handleSubmit} style={{ marginBottom: '30px' }}>
        <FormErrorMessage />
        <Form.Item label="Cluster" validateStatus={clusterError ? 'error' : ''} help={clusterError || ''}>
          {getFieldDecorator('cluster', {
            rules: [{ required: true, message: 'Please select the cluster!' }],
            initialValue: clusters.items.length === 1 ? clusters.items[0].metadata.name : undefined
          })(
            <Select placeholder="Cluster">
              {clusters.items.map(c => (
                <Select.Option key={c.metadata.name} value={c.metadata.name}>{c.metadata.name}</Select.Option>
              ))}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Name" validateStatus={nameError ? 'error' : ''} help={nameError || ''}>
          {getFieldDecorator('name', {
            rules: [
              { required: true, message: 'Please enter the namespace name!' },
              { pattern: '^[a-z0-9-_]+$', message: 'Name must only contain lowercase letters, numbers, hyphen and underscore' }
            ]
          })(
            <Input placeholder="Name" />,
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting} disabled={this.disableButton(getFieldsError())}>Save</Button>
          <Button type="link" onClick={this.cancel}>Cancel</Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedNamespaceClaimForm = Form.create({ name: 'namespace_claim' })(NamespaceClaimForm)

export default WrappedNamespaceClaimForm
