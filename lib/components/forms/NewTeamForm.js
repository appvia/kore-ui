import * as React from 'react'
import canonical from '../../utils/canonical'
import redirect from '../../utils/redirect'
import apiRequest from '../../utils/api-request'
import Team from '../../crd/Team'

import { Typography, Button, Form, Input, Alert, Switch, Card, Row, Col, Tooltip, Icon, Radio, Table } from 'antd'

const { Text, Paragraph } = Typography

class NewTeamForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      buttonText: 'Save',
      submitting: false,
      formErrorMessage: false,
      buildCluster: true,
      selectedPlan: 0,
      showPlanDetails: false
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

    const state = { ...this.state }
    state.buttonText = 'Saving...'
    state.submitting = true
    state.formErrorMessage = false
    this.setState(state)

    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const canonicalTeamName = canonical(values.teamName)
        const spec = {
          summary: values.teamName,
          description: values.teamDescription
        }
        try {
          await apiRequest(null, 'put', `/teams/${canonicalTeamName}`, Team(canonicalTeamName, spec))
          await apiRequest(null, 'put', `/teams/${canonicalTeamName}/members/${this.props.user.username}`)
          return redirect(null, `/teams/${canonicalTeamName}`)
        } catch (err) {
          console.error('Error submitting form', err)
          const state = { ...this.state }
          state.buttonText = 'Save'
          state.submitting = false
          state.formErrorMessage = 'An error occurred creating the team, please try again'
          this.setState(state)
        }
      }
    })
  }

  onPlanChange = e => {
    const state = { ...this.state }
    state.selectedPlan = e.target.value
    this.setState(state)
  }

  onSwitchChange = value => {
    const state = { ...this.state }
    state.buildCluster = value
    this.setState(state)
  }

  showHidePlanDetails = () => {
    const state = { ...this.state }
    state.showPlanDetails = !state.showPlanDetails
    this.setState(state)
  }

  render() {
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
    const teamNameError = isFieldTouched('teamName') && getFieldError('teamName')
    const teamDescriptionError = isFieldTouched('teamDescription') && getFieldError('teamDescription')

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

    const clusterName = () => {
      const teamName = this.props.form.getFieldValue('teamName')
      if (teamName) {
        return `gcp-gke-${canonical(teamName)}-notprod`
      }
      return 'generated using your team name'
    }

    const plans = this.props.plans.items || []
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
    const planValues = Object.keys(plans[this.state.selectedPlan].spec.values)
      .map(key => ({
        key,
        property: key,
        value: `${plans[this.state.selectedPlan].spec.values[key]}`
      }))
    const selectedPlan = plans[this.state.selectedPlan]

    const ClusterBuildInfo = () => this.state.buildCluster ? (
      <div>
        <Card style={{borderTop: 'none'}}>
          <div className="body">
            <Row style={{padding: '5px 0'}}>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Text strong>Cluster provider</Text>
              </Col>
              <Col>
                <Text>GKE</Text>
              </Col>
            </Row>
            <Row style={{padding: '5px 0'}}>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Text strong>Cluster name</Text>
              </Col>
              <Col>
                <Text>{clusterName()}</Text>
              </Col>
            </Row>
            <Row style={{padding: '5px 0'}}>
              <Col xs={24} sm={12} md={8} lg={6} xl={4}>
                <Text strong>Plan</Text>
              </Col>
              <Col>
                <Radio.Group onChange={this.onPlanChange} value={this.state.selectedPlan}>
                  {plans.map((p, idx) => (
                    <Radio.Button value={idx}>{p.spec.description}</Radio.Button>
                  ))}
                </Radio.Group>
              </Col>
            </Row>
            <Row style={{padding: '5px 0', marginTop: '15px'}}>
              <Card>
                <Paragraph style={{marginBottom: '0'}}>
                  <Text strong>{selectedPlan.spec.description} - {selectedPlan.spec.summary}</Text>
                  <Text style={{float: 'right'}}>
                    <a onClick={this.showHidePlanDetails}>{this.state.showPlanDetails ? 'Hide' : 'Show'} plans details</a>
                  </Text>
                </Paragraph>
                {this.state.showPlanDetails ? (
                  <Table
                    style={{marginTop: '20px'}}
                    size="middle"
                    pagination={false}
                    columns={planColumns}
                    dataSource={planValues}
                  />
                ): null }
              </Card>
            </Row>
          </div>
        </Card>
        <div className="footer">
          <Text>
            <Icon theme="filled" style={{marginRight: '10px'}} type="info-circle" />
            You can create a production ready cluster anytime from your team dashboard
          </Text>
        </div>
        <style jsx>{`
        .footer {
          padding: 15px 24px;
          border: 1px solid #e8e8e8;
          background-color: #fafafa;
          border-top: none;
        }
        `}</style>
      </div>
    ) : null

    return (
      <Form {...formConfig} onSubmit={this.handleSubmit}>
        <div>{formErrorMessage()}</div>
        <Form.Item label="Team name" validateStatus={teamNameError ? 'error' : ''} help={teamNameError || ''}>
          {getFieldDecorator('teamName', {
            rules: [{ required: true, message: 'Please enter your team name!' }],
          })(
            <Input placeholder="Team name" />,
          )}
        </Form.Item>
        <Form.Item label="Team description" validateStatus={teamDescriptionError ? 'error' : ''} help={teamDescriptionError || ''}>
          {getFieldDecorator('teamDescription', {
            rules: [{ required: true, message: 'Please enter your team description!' }],
          })(
            <Input placeholder="Team description" />,
          )}
        </Form.Item>
        <Row>
          <Col sm={24} md={6} lg={4}>
            <Text className="ant-form-item-label" style={{color: '#262626'}}>Kubernetes :</Text>
          </Col>
          <Col sm={23} md={17} lg={19}>
            <div className="header">
              <Switch size="small" defaultChecked onChange={this.onSwitchChange} />
              <Text style={{marginLeft: '10px'}}>
                This team will be deploying applications to Kubernetes
                <Tooltip title="If so, the hub can create a cluster ready for your deployments">
                  <Icon theme="filled" style={{marginLeft: '10px'}} type="info-circle" />
                </Tooltip>
              </Text>
            </div>
            <ClusterBuildInfo />
          </Col>
        </Row>
        <Form.Item style={{ marginBottom: '0'}}>
          <Button type="primary" htmlType="submit" disabled={this.disableButton(getFieldsError())}>{this.state.buttonText}</Button>
        </Form.Item>
        <style jsx>{`
        .header {
          padding: 15px 24px;
          border: 1px solid #e8e8e8;
          background-color: #fafafa;
        }
        `}</style>
      </Form>
    )
  }
}

const WrappedNewTeamForm = Form.create({ name: 'new_team' })(NewTeamForm)

export default WrappedNewTeamForm
