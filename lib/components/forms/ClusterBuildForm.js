import * as React from 'react'
import PropTypes from 'prop-types'
import Link from 'next/link'
import copy from '../../utils/object-copy'
import redirect from '../../utils/redirect'
import apiRequest from '../../utils/api-request'
import Generic from '../../crd/Generic'
import CloudSelector from '../cluster-build/CloudSelector'
import MissingProvider from '../cluster-build/MissingProvider'

import { Typography, Button, Form, Select, Alert, Card, Radio, List, Table, Modal, message } from 'antd'
const { Text, Title } = Typography
const { Option } = Select

class ClusterBuildForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    skipButtonText: PropTypes.string,
    team: PropTypes.object.isRequired,
    teamClusters: PropTypes.array.isRequired,
    user: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      submitButtonText: 'Save',
      skipButtonText: this.props.skipButtonText || 'Skip',
      submitting: false,
      formErrorMessage: false,
      selectedProvider: false,
      selectedPlan: false,
      selectedCloud: '',
      dataLoading: true,
      providers: {}
    }
  }

  async fetchComponentData() {
    const team = this.props.team.metadata.name
    const [ allocations, plans ] = await Promise.all([
      apiRequest(null, 'get', `/teams/${team}/allocations?assigned=true`),
      apiRequest(null, 'get', '/plans')
    ])
    return { allocations, plans }
  }

  componentDidMount() {
    return this.fetchComponentData()
      .then(({ allocations, plans }) => {
        console.log('data', allocations, plans)
        const gkeCredentials = (allocations.items || []).filter(a => a.spec.resource.kind === 'GKECredentials')
        const eksCredentials = (allocations.items || []).filter(a => a.spec.resource.kind === 'EKSCredentials')
        const state = copy(this.state)
        state.providers.GKE = gkeCredentials
        state.providers.EKS = eksCredentials
        state.plans = plans
        state.dataLoading = false
        this.setState(state)
      })
  }

  disableButton = () => !this.state.selectedPlan || this.state.submitting

  handleSubmit = e => {
    e.preventDefault()

    this.props.form.validateFields(async err => {
      if (!err) {
        const state = copy(this.state)
        state.submitting = true
        state.formErrorMessage = false
        this.setState(state)

        const canonicalTeamName = this.props.team.metadata.name
        const clusterName = this.generateClusterName()
        const selectedProvider = this.state.selectedProvider
        const gkeSpec = {
          description: this.state.selectedPlan.spec.description,
          ...this.state.selectedPlan.spec.values,
          credentials: selectedProvider.spec.resource
        }
        const gkeResource = Generic({
          apiVersion: 'gke.compute.kore.appvia.io/v1alpha1',
          kind: 'GKE',
          name: clusterName,
          spec: gkeSpec
        })
        const k8sSpec = {
          domain: 'demo.kore.appvia.io',
          inheritTeamMembers: true,
          defaultTeamRole: 'cluster-admin',
          provider: selectedProvider.spec.resource,
          enableDefaultTrafficBlock: false,
          clusterUsers: [{
            username: this.props.user.username,
            roles: ['readonly']
          }]
        }
        const k8sResource = Generic({
          apiVersion: 'clusters.compute.kore.appvia.io/v1alpha1',
          kind: 'Kubernetes',
          name: clusterName,
          spec: k8sSpec
        })
        try {
          await apiRequest(null, 'put', `/teams/${canonicalTeamName}/gkes/${clusterName}`, gkeResource)
          await apiRequest(null, 'put', `/teams/${canonicalTeamName}/clusters/${clusterName}`, k8sResource)
          message.loading('Cluster build requested...')
          return redirect(null, `/teams/${canonicalTeamName}`)
        } catch (err) {
          console.error('Error submitting form', err)
          const state = copy(this.state)
          state.submitting = false
          state.formErrorMessage = 'An error occurred requesting the cluster, please try again'
          this.setState(state)
        }
      }
    })
  }

  onProviderChange = value => {
    const state = copy(this.state)
    state.selectedProvider = this.state.providers[this.state.selectedCloud].find(p => p.metadata.name === value)
    this.setState(state)
  }

  onPlanChange = e => {
    const state = copy(this.state)
    state.selectedPlan = this.state.plans.items.find(p => p.metadata.name === e.target.value)
    this.setState(state)
  }

  showPlanDetails = () => {
    const selectedPlan = this.state.selectedPlan
    const planColumns = [{
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
    }, {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
    }]
    const planValues = selectedPlan ?
      Object.keys(selectedPlan.spec.values).map(key => {
        let value = selectedPlan.spec.values[key]
        if (key === 'authorizedMasterNetworks') {
          const complexValue = selectedPlan.spec.values[key]
          value = `${complexValue[0].name}: ${complexValue[0].cidr}`
        }
        return {
          key,
          property: key,
          value: `${value}`
        }
      }) :
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

  matchingClusters = (clusterName) => {
    return this.props.teamClusters.filter(tc => tc.metadata.name.indexOf(clusterName) >= 0)
  }

  rawClusterName = () => this.state.selectedPlan ? `${this.state.selectedProvider.metadata.name}-${this.props.team.metadata.name}-${this.state.selectedPlan.metadata.name}` : ''

  generateClusterName = () => {
    let clusterName = this.rawClusterName()
    const matchingClusters = this.matchingClusters(clusterName)
    const matchingClusterCount = matchingClusters.length
    if (matchingClusterCount) {
      clusterName = `${clusterName}-${matchingClusterCount + 1}`
    }
    return clusterName
  }

  handleSelectCloud = cloud => {
    const state = copy(this.state)
    state.selectedCloud = cloud
    state.selectedProvider = false
    state.selectedPlan = false
    this.setState(state)
  }

  render() {
    if (this.state.dataLoading) {
      return null
    }

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

    const { providers, plans, selectedCloud, selectedProvider, selectedPlan } = this.state
    const availablePlans = plans.items.filter(p => p.spec.kind === selectedCloud)
    const clusterName = this.generateClusterName()
    const matchingClusters = this.matchingClusters(this.rawClusterName())

    const ClusterBuildInfo = () => (
      <div>
        <Card title="Choose a provider and plan">
          <div>{formErrorMessage()}</div>
          <Form.Item label="Provider">
            {getFieldDecorator('provider', {
              rules: [{ required: true, message: 'Please select your provider!' }],
            })(
              <Select
                placeholder="Provider"
                onChange={this.onProviderChange}
              >
                {providers[selectedCloud].map(provider => <Option key={provider.metadata.name} value={provider.metadata.name}>{provider.spec.name} - {provider.spec.summary}</Option>)}
              </Select>
            )}
          </Form.Item>
          {selectedProvider ? (
            <Form.Item label="Plan">
              {getFieldDecorator('plan', {
                rules: [{ required: true, message: 'Please select your plan!' }],
              })(
                <Radio.Group onChange={this.onPlanChange}>
                  {availablePlans.map((p, idx) => (
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
            <div>
              <Form.Item label="Cluster name">
                <Text>{clusterName}</Text>
              </Form.Item>
              {matchingClusters.length > 0 ? (
                <Alert
                  message={`Existing clusters matching "${this.state.selectedPlan.spec.description}" plan`}
                  description={
                    <List
                      size="small"
                      dataSource={matchingClusters}
                      renderItem={cluster => (
                        <List.Item>
                          <Text>{cluster.metadata.name}</Text>
                        </List.Item>
                      )}
                    />
                  }
                  type="info"
                  style={{ marginBottom: '20px'}}
                />
              ) : null}
            </div>
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

    return (
      <div>
        <CloudSelector selectedCloud={selectedCloud} handleSelectCloud={this.handleSelectCloud} />
        {selectedCloud ? (
          providers[selectedCloud].length > 0 ?
            <Form {...formConfig} onSubmit={this.handleSubmit}>
              <ClusterBuildInfo />
            </Form> :
            <MissingProvider team={this.props.team.metadata.name} />
        ) : null}
      </div>
    )
  }
}

const WrappedClusterBuildForm = Form.create({ name: 'new_team_cluster_build' })(ClusterBuildForm)

export default WrappedClusterBuildForm
