import * as React from 'react'
import PropTypes from 'prop-types'
import canonical from '../../utils/canonical'
import apiRequest from '../../utils/api-request'
import apiPaths from '../../utils/api-paths'
import copy from '../../utils/object-copy'
import Team from '../../crd/Team'
import { Button, Form, Input, Alert, message, Typography } from 'antd'

const { Paragraph, Text } = Typography

class NewTeamForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired,
    handleTeamCreated: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    team: PropTypes.any
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
        const canonicalTeamName = canonical(values.teamName)
        const spec = {
          summary: values.teamName,
          description: values.teamDescription
        }
        try {
          const checkTeam = await apiRequest(null, 'get', apiPaths.team(canonicalTeamName).self)
          const teamExists = Object.keys(checkTeam).length !== 0
          if (!teamExists) {
            const team = await apiRequest(null, 'put', apiPaths.team(canonicalTeamName).self, Team(canonicalTeamName, spec))
            await this.props.handleTeamCreated(team)
            const state = copy(this.state)
            state.submitting = false
            this.setState(state)
            message.success('Team created')
          } else {
            const state = copy(this.state)
            state.submitting = false
            state.formErrorMessage = `A team with the name "${values.teamName}" already exists`
            this.setState(state)
          }
        } catch (err) {
          console.error('Error submitting form', err)
          const state = copy(this.state)
          state.submitting = false
          state.formErrorMessage = 'An error occurred creating the team, please try again'
          this.setState(state)
        }
      }
    })
  }

  render() {
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched, getFieldValue } = this.props.form
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

    const FormErrorMessage = () => {
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
      <Form {...formConfig} onSubmit={this.handleSubmit} style={{ marginBottom: '20px' }}>
        <FormErrorMessage />
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

        <Alert
          message={
            <div>
              <Paragraph>The team ID is: <Text strong>{canonical(getFieldValue('teamName') || '')}</Text></Paragraph>
              <Paragraph style={{ marginBottom: '0' }}>This is how your team will appear when using the Kore CLI.</Paragraph>
            </div>
          }
          type="info"
        />
        {!this.props.team ? (
          <Form.Item style={{ marginTop: '20px'}}>
            <Button type="primary" htmlType="submit" loading={this.state.submitting} disabled={this.disableButton(getFieldsError())}>Save</Button>
          </Form.Item>
        ) : null}
      </Form>
    )
  }
}

const WrappedNewTeamForm = Form.create({ name: 'new_team' })(NewTeamForm)

export default WrappedNewTeamForm
