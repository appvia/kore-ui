import * as React from 'react'
import Link from 'next/link'
import redirect from '../../utils/redirect'
import apiRequest from '../../utils/api-request'
import Generic from '../../crd/Generic'

import { Typography, Button, Form, Select, Alert, Card, Radio, Table, Modal, message } from 'antd'
const { Text, Title } = Typography
const { Option } = Select

class ClusterBuildForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      submitButtonText: 'Save',
      skipButtonText: this.props.skipButtonText || 'Skip',
      submitting: false,
      formErrorMessage: false,
      selectedProvider: false,
      selectedBinding: false,
      selectedResource: false,
      selectedPlan: false
    }
  }

  disableButton = () => !this.state.selectedPlan || this.state.submitting

  handleSubmit = e => {
    e.preventDefault()

    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const state = { ...this.state }
        state.submitButtonText = 'Saving...'
        state.submitting = true
        state.formErrorMessage = false
        this.setState(state)

        const canonicalTeamName = this.props.team.metadata.name
        const binding = this.state.selectedBinding
        const resourceName = `${binding}-${canonicalTeamName}-${this.state.selectedPlan.metadata.name}`
        const resourceKind = this.state.selectedResource.kind
        const spec = {
          name: resourceName,
          description: this.state.selectedPlan.spec.description,
          ...this.state.selectedPlan.spec.values
        }
        const resource = Generic({
          apiVersion: `${this.state.selectedResource.group}/${this.state.selectedResource.version}`,
          kind: resourceKind,
          name: resourceName,
          spec
        })
        try {
          await apiRequest(null, 'put', `/teams/${canonicalTeamName}/resources/${binding}/${resourceKind}`, resource)
          message.loading('Cluster build requested...')
          return redirect(null, `/teams/${canonicalTeamName}`)
        } catch (err) {
          console.error('Error submitting form', err)
          const state = { ...this.state }
          state.submitButtonText = 'Save'
          state.submitting = false
          state.formErrorMessage = 'An error occurred requesting the cluster, please try again'
          this.setState(state)
        }
      }
    })
  }

  handleSkip = () => {
    const canonicalTeamName = this.props.team.metadata.name
    return redirect(null, `/teams/${canonicalTeamName}`)
  }

  onProviderChange = value => {
    const [className, binding, resourceKind] = value.split('|')
    const state = { ...this.state }
    state.selectedProvider = this.props.providers.find(p => p.spec.class === className)
    state.selectedBinding = binding
    state.selectedResource = state.selectedProvider.spec.resources.find(r => r.kind === resourceKind)
    this.setState(state)
  }

  onPlanChange = e => {
    const state = { ...this.state }
    state.selectedPlan = this.props.plans.items.find(p => p.metadata.name === e.target.value)
    this.setState(state)
  }

  showPlanDetails = () => {
    const selectedPlan = this.state.selectedPlan
    const planColumns = [
      {
        title: 'Property',
        dataIndex: 'property',
        key: 'property',
      },
      {
        title: 'Value',
        dataIndex: 'value',
        key: 'value',
      }
    ]
    const planValues = selectedPlan ?
      Object.keys(selectedPlan.spec.values).map(key => ({
        key,
        property: key,
        value: `${selectedPlan.spec.values[key]}`
      })) :
      null
    Modal.info({
      title: (<div><Title level={4}>{selectedPlan.spec.description}</Title><Text>{selectedPlan.spec.summary}</Text></div>),
      content: (
        <Table
          size="small"
          pagination={false}
          columns={planColumns}
          dataSource={planValues}
        />
      ),
      width: 700,
      onOk() {}
    })
  }

  render() {
    if (!this.props.team) {
      return null
    }

    const { getFieldDecorator } = this.props.form
    const formConfig = {
      layout: 'horizontal',
      labelAlign: 'left',
      hideRequiredMark: true,
      labelCol: {
        sm: { span: 24 },
        md: { span: 24 },
        lg: { span: 6 }
      },
      wrapperCol: {
        sm: { span: 24 },
        md: { span: 24 },
        lg: { span: 18 }
      }
    }

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

    const resourcePlans = this.state.selectedResource ? this.state.selectedResource.plans : null
    const filteredPlans = this.props.plans.items.filter(p => resourcePlans && resourcePlans.includes(p.metadata.name))
    const selectedPlan = this.state.selectedPlan
    const clusterName = this.state.selectedPlan ? `${this.state.selectedProvider.spec.bindings[0]}-${this.props.team.metadata.name}-${this.state.selectedPlan.metadata.name}` : ''

    const ClusterBuildInfo = () => (
      <div>
        <Card title="Choose a cloud provider and cluster plan">
          <div>{formErrorMessage()}</div>
          <Form.Item label="Cluster provider">
            {getFieldDecorator('provider', {
              rules: [{ required: true, message: 'Please select your provider!' }],
            })(
              <Select
                placeholder="Select cluster provider"
                onChange={this.onProviderChange}
              >
                {this.props.providers.map(provider =>
                  provider.spec.bindings.map(binding =>
                    provider.spec.resources.map(resource => (
                      <Option value={`${provider.spec.class}|${binding}|${resource.kind}`}>{provider.spec.displayName} ({binding}) - {resource.displayName}</Option>
                    ))
                  )
                )}
              </Select>
            )}
          </Form.Item>
          {resourcePlans ? (
            <Form.Item label="Cluster plan">
              {getFieldDecorator('plan', {
                rules: [{ required: true, message: 'Please select your cluster plan!' }],
              })(
                <Radio.Group onChange={this.onPlanChange}>
                  {filteredPlans.map((p, idx) => (
                    <Radio.Button key={idx} value={p.metadata.name}>{p.spec.description}</Radio.Button>
                  ))}
                </Radio.Group>
              )}
              {selectedPlan ?
                <a style={{marginLeft: '20px'}} onClick={this.showPlanDetails}>View plan details</a> :
                null
              }
            </Form.Item>
          ) : null}

          {selectedPlan ? (
            <Form.Item label="Cluster name">
              <Text>{clusterName}</Text>
            </Form.Item>
          ) : null}
          <Form.Item style={{ marginBottom: '0'}}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={this.disableButton()}
            >
              {this.state.submitButtonText}
            </Button>
            <Button type="link" style={{ marginLeft: '10px'}}>
              <Link href="/teams/[name]" as={`/teams/${this.props.team.metadata.name}`}>
                <a>{this.state.skipButtonText}</a>
              </Link>
            </Button>
          </Form.Item>
        </Card>
      </div>
    )

    const ClusterBuildNotAvailable = () => (
      <div>
        <Alert
          message="No cluster providers found"
          description="No cluster providers could be found allocated to this team, therefore you cannot request a cluster build at this time. Please continue to the team dashboard."
          type="info"
          showIcon
          style={{ marginBottom: '20px'}}
        />
        <Button type="primary" onClick={this.handleSkip}>Team dashboard</Button>
      </div>
    )

    return (
      <Form {...formConfig} onSubmit={this.handleSubmit}>
        {this.props.providers.length === 0 ? <ClusterBuildNotAvailable /> : <ClusterBuildInfo />}
      </Form>
    )
  }
}

const WrappedClusterBuildForm = Form.create({ name: 'new_team_cluster_build' })(ClusterBuildForm)

export default WrappedClusterBuildForm
