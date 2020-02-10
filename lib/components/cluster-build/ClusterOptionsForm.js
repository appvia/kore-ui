import * as React from 'react'
import PropTypes from 'prop-types'
import copy from '../../utils/object-copy'

import { Typography, Form, Select, Alert, Card, Radio, List, Table, Modal } from 'antd'
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

  state = {
    selectedProvider: false,
    selectedPlan: false
  }

  onProviderChange = value => {
    const state = copy(this.state)
    state.selectedProvider = this.props.providers.find(p => p.metadata.name === value)
    this.setState(state)
  }

  onPlanChange = e => {
    const state = copy(this.state)
    state.selectedPlan = this.props.plans.find(p => p.metadata.name === e.target.value)
    this.setState(state)
  }

  matchingClusters = (clusterName) => this.props.teamClusters.filter(tc => tc.metadata.name.indexOf(clusterName) >= 0)

  rawClusterName = () => this.state.selectedPlan && this.state.selectedProvider ?
    `${this.state.selectedProvider.metadata.name}-${this.props.team.metadata.name}-${this.state.selectedPlan.metadata.name}` :
    ''

  generateClusterName = () => {
    let clusterName = this.rawClusterName()
    const matchingClusters = this.matchingClusters(clusterName)
    const matchingClusterCount = matchingClusters.length
    if (matchingClusterCount) {
      clusterName = `${clusterName}-${matchingClusterCount + 1}`
    }
    return clusterName
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

  render() {
    const { getFieldDecorator } = this.props.form

    const { providers, plans } = this.props
    const { selectedProvider, selectedPlan } = this.state
    const availablePlans = plans
    const clusterName = this.generateClusterName()
    const matchingClusters = this.matchingClusters(this.rawClusterName())

    return (
      <Card title="Choose a provider and plan">
        <Form.Item label="Provider">
          {getFieldDecorator('provider', {
            rules: [{ required: true, message: 'Please select your provider!' }],
          })(
            <Select
              placeholder="Provider"
              onChange={this.onProviderChange}
            >
              {providers.map(provider => <Option key={provider.metadata.name} value={provider.metadata.name}>{provider.spec.name} - {provider.spec.summary}</Option>)}
            </Select>
          )}
        </Form.Item>
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

        {selectedPlan && selectedProvider ? (
          <div>
            <Form.Item label="Cluster name" style={{ marginBottom: '0'}}>
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
                style={{ marginTop: '20px'}}
              />
            ) : null}
          </div>
        ) : null}
      </Card>
    )
  }
}

const WrappedClusterOptionsForm = Form.create({ name: 'cluster_options' })(ClusterOptionsForm)

export default WrappedClusterOptionsForm
