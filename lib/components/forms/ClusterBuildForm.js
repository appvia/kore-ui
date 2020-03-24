import * as React from 'react'
import PropTypes from 'prop-types'
import copy from '../../utils/object-copy'
import redirect from '../../utils/redirect'
import apiRequest from '../../utils/api-request'
import apiPaths from '../../utils/api-paths'
import Generic from '../../crd/Generic'
import CloudSelector from '../cluster-build/CloudSelector'
import MissingProvider from '../cluster-build/MissingProvider'
import ClusterOptionsForm from '../cluster-build/ClusterOptionsForm'
import KubernetesOptionsForm from '../cluster-build/KubernetesOptionsForm'

import { Button, Form, Alert, message } from 'antd'

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
      selectedCloud: '',
      dataLoading: true,
      providers: {},
      showKubernetesOptions: false
    }
  }

  async fetchComponentData() {
    const team = this.props.team.metadata.name
    const [ allocations, plans ] = await Promise.all([
      apiRequest(null, 'get', `${apiPaths.team(team).allocations}?assigned=true`),
      apiRequest(null, 'get', apiPaths.plans)
    ])
    return { allocations, plans }
  }

  componentDidMount() {
    return this.fetchComponentData()
      .then(({ allocations, plans }) => {
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

  validateForms(callback) {
    this.clusterOptionsForm.props.form.validateFields((clusterFormErr, clusterFormValues) => {
      if (this.state.showKubernetesOptions) {
        this.kubernetesOptionsForm.props.form.validateFields((k8sFormErr, k8sFormValues) => {
          const err = { ...clusterFormErr, ...k8sFormErr }
          const values = { ...clusterFormValues, ...k8sFormValues }
          callback(Object.keys(err).length > 0 ? err : false, values)
        })
      } else {
        callback(clusterFormErr, clusterFormValues)
      }
    })
  }

  handleSubmit = e => {
    e.preventDefault()

    this.validateForms(async (err, values) => {
      if (!err) {
        const state = copy(this.state)
        state.submitting = true
        state.formErrorMessage = false
        this.setState(state)

        const canonicalTeamName = this.props.team.metadata.name
        const selectedCloud = this.state.selectedCloud
        const selectedProvider = this.state.providers[selectedCloud].find(p => p.metadata.name === values.provider)
        const selectedPlan = this.state.plans.items.find(p => p.metadata.name === values.plan)
        const clusterName = values.clusterName
        const showKubernetesOptions = this.state.showKubernetesOptions

        const providerPath = {
          'GKE': 'gkes',
          'EKS': 'ekss'
        }[selectedCloud]

        try {
          const gkeSpec = {
            description: selectedPlan.spec.description,
            ...selectedPlan.spec.values,
            credentials: selectedProvider.spec.resource
          }
          const apiVersion = `${selectedProvider.spec.resource.group}/${selectedProvider.spec.resource.version}`
          const clusterResource = Generic({
            apiVersion,
            kind: selectedCloud,
            name: clusterName,
            spec: gkeSpec
          })
          const providerResult = await apiRequest(null, 'put', `${apiPaths.team(canonicalTeamName)[providerPath]}/${clusterName}`, clusterResource)
          const k8sSpec = {
            inheritTeamMembers: true,
            defaultTeamRole: 'cluster-admin',
            provider: {
              group: selectedProvider.spec.resource.group,
              version: selectedProvider.spec.resource.version,
              kind: selectedCloud,
              name: providerResult.metadata.name,
              namespace: providerResult.metadata.namespace
            },
            enableDefaultTrafficBlock: false
          }
          if (showKubernetesOptions) {
            showKubernetesOptions.domain = values.domain
          }
          const k8sResource = Generic({
            apiVersion: 'clusters.compute.kore.appvia.io/v1alpha1',
            kind: 'Kubernetes',
            name: clusterName,
            spec: k8sSpec
          })

          await apiRequest(null, 'put', `${apiPaths.team(canonicalTeamName).clusters}/${clusterName}`, k8sResource)
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

  handleSelectCloud = cloud => {
    if (this.state.selectedCloud !== cloud) {
      const state = copy(this.state)
      state.selectedCloud = cloud
      this.setState(state)
    }
  }

  render() {
    if (this.state.dataLoading || !this.props.team) {
      return null
    }

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

    const { submitting, providers, selectedCloud, showKubernetesOptions } = this.state
    const filteredPlans = this.state.plans.items.filter(p => p.spec.kind === selectedCloud)
    const filteredProviders = this.state.providers[selectedCloud]

    const ClusterBuildForm = () => (
      <Form {...formConfig} onSubmit={this.handleSubmit}>
        <div>{formErrorMessage()}</div>
        <ClusterOptionsForm
          team={this.props.team}
          providers={filteredProviders}
          plans={filteredPlans}
          teamClusters={this.props.teamClusters}
          wrappedComponentRef={inst => this.clusterOptionsForm = inst}
        />
        {showKubernetesOptions ? (
          <KubernetesOptionsForm
            wrappedComponentRef={inst => this.kubernetesOptionsForm = inst}
          />
        ) :null}
        <Form.Item style={{ marginTop: '20px'}}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {this.state.submitButtonText}
          </Button>
        </Form.Item>
      </Form>
    )

    return (
      <div>
        <CloudSelector showCustom={true} providers={providers} selectedCloud={selectedCloud} handleSelectCloud={this.handleSelectCloud} />
        {selectedCloud ? (
          filteredProviders.length > 0 ?
            <ClusterBuildForm /> :
            <MissingProvider team={this.props.team.metadata.name}/>
        ) : null}
      </div>
    )
  }
}

const WrappedClusterBuildForm = Form.create({ name: 'new_team_cluster_build' })(ClusterBuildForm)

export default WrappedClusterBuildForm
