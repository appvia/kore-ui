import * as React from 'react'
import PropTypes from 'prop-types'

import { Typography, Form, Select, Card, Radio, Table, Modal, Input } from 'antd'
const { Text, Title } = Typography
const { Option } = Select

class ClusterOptionsForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    team: PropTypes.object.isRequired,
    providers: PropTypes.array.isRequired,
    plans: PropTypes.array.isRequired,
    teamClusters: PropTypes.array.isRequired
  }

  onPlanChange = e => {
    if (this.props.form.getFieldValue('clusterName')) {
      this.props.form.setFieldsValue({ 'clusterName': this.generateClusterName(e.target.value) })
    }
  }

  generateClusterName = selectedPlan => {
    let clusterName = `${this.props.team.metadata.name}-${selectedPlan}`
    const matchingClusters = this.props.teamClusters.filter(tc => tc.metadata.name.indexOf(clusterName) === 0)
    if (matchingClusters.length) {
      clusterName = `${clusterName}-${matchingClusters.length + 1}`
    }
    return clusterName
  }

  showPlanDetails = planName => {
    return () => {
      const selectedPlan = this.props.plans.find(p => p.metadata.name === planName)
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
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form
    const { providers, plans } = this.props
    const selectedPlan = getFieldValue('plan')

    const checkForDuplicateName = (rule, value) => {
      const matchingCluster = this.props.teamClusters.find(tc => tc.metadata.name === value)
      if (!matchingCluster) {
        return Promise.resolve()
      }
      return Promise.reject('This name is already used!')
    }

    return (
      <Card title="Choose a provider and plan">
        <Form.Item label="Provider">
          {getFieldDecorator('provider', {
            rules: [{ required: true, message: 'Please select your provider!' }],
            initialValue: providers.length === 1 ? providers[0].metadata.name : undefined
          })(
            <Select placeholder="Provider">
              {providers.map(provider => <Option key={provider.metadata.name} value={provider.metadata.name}>{provider.spec.name} - {provider.spec.summary}</Option>)}
            </Select>
          )}
        </Form.Item>
        <Form.Item label="Plan">
          {getFieldDecorator('plan', {
            rules: [{ required: true, message: 'Please select your plan!' }],
          })(
            <Radio.Group onChange={this.onPlanChange}>
              {plans.map((p, idx) => (
                <Radio.Button key={idx} value={p.metadata.name}>{p.spec.description}</Radio.Button>
              ))}
            </Radio.Group>
          )}
          {selectedPlan ?
            <a style={{marginLeft: '20px'}} onClick={this.showPlanDetails(selectedPlan)}>View plan details</a> :
            null
          }
        </Form.Item>
        {selectedPlan ? (
          <Form.Item label="Cluster name">
            {getFieldDecorator('clusterName', {
              rules: [
                { required: true, message: 'Please enter cluster name!' },
                { pattern: '^[a-z][a-z0-9-]{0,38}[a-z0-9]$', message: 'Name must consist of lower case alphanumeric characters or "-", it must start with a letter and end with an alphanumeric and must be no longer than 40 characters' },
                { validator: checkForDuplicateName }
              ],
              initialValue: this.generateClusterName(selectedPlan)
            })(
              <Input />
            )}
          </Form.Item>
        ) : null}
      </Card>
    )
  }
}

const WrappedClusterOptionsForm = Form.create({ name: 'cluster_options' })(ClusterOptionsForm)

export default WrappedClusterOptionsForm
