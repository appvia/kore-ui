import * as React from 'react'
import PropTypes from 'prop-types'
import canonical from '../../utils/canonical'
import apiRequest from '../../utils/api-request'
import Team from '../../crd/Team'
import { Button, Form, Input, Alert, message } from 'antd'

class NewTeamForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    handleTeamCreated: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    team: PropTypes.object
  }

  constructor(props) {
    super(props)
    this.state = {
      buttonText: 'Save',
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
          const team = await apiRequest(null, 'put', `/teams/${canonicalTeamName}`, Team(canonicalTeamName, spec))
          await apiRequest(null, 'put', `/teams/${canonicalTeamName}/members/${this.props.user.username}`)
          await this.props.handleTeamCreated(team)
          const state = { ...this.state }
          state.submitting = false
          this.setState(state)
          message.success('Team created')
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

    return (
      <Form {...formConfig} onSubmit={this.handleSubmit} style={{ marginBottom: '30px' }}>
        <div>{formErrorMessage()}</div>
        <Form.Item label="Team name" validateStatus={teamNameError ? 'error' : ''} help={teamNameError || ''}>
          {getFieldDecorator('teamName', {
            rules: [{ required: true, message: 'Please enter your team name!' }],
          })(
            <Input placeholder="Team name" disabled={!!this.props.team} />,
          )}
        </Form.Item>
        <Form.Item label="Team description" validateStatus={teamDescriptionError ? 'error' : ''} help={teamDescriptionError || ''}>
          {getFieldDecorator('teamDescription', {
            rules: [{ required: true, message: 'Please enter your team description!' }],
          })(
            <Input placeholder="Team description" disabled={!!this.props.team} />,
          )}
        </Form.Item>
        {!this.props.team ? (
          <Form.Item style={{ marginBottom: '0'}}>
            <Button type="primary" htmlType="submit" loading={this.state.submitting} disabled={this.disableButton(getFieldsError())}>{this.state.buttonText}</Button>
          </Form.Item>
        ) : null}
      </Form>
    )
  }
}

const WrappedNewTeamForm = Form.create({ name: 'new_team' })(NewTeamForm)

export default WrappedNewTeamForm
