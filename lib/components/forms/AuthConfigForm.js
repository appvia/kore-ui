import * as React from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import redirect from '../../utils/redirect'
import { Button, Form, Input, Alert } from 'antd'

class AuthConfigForm extends React.Component {
  static propTypes = {
    form: PropTypes.any.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      buttonText: 'Save',
      submitting: false,
      formErrorMessage: false
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

    this.setState({
      buttonText: 'Saving...',
      submitting: true,
      formErrorMessage: false
    })

    this.props.form.validateFields((err, values) => {
      if (!err) {
        const body = {
          name: 'github',
          config: values
        }
        axios.post(`${window.location.origin}/auth/configure`, body)
          .then(function (res) {
            if (res.status === 200) {
              return redirect(null, '/setup/auth/complete')
            }
          })
          .catch(function (error) {
            console.error('An error occurred saving the configuration', error)
            this.setState({
              buttonText: 'Save',
              submitting: false,
              formErrorMessage: 'An error occurred saving the configuration, please try again'
            })
          }.bind(this))
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
        md: { span: 5 },
        lg: { span: 4 },
      },
      wrapperCol: {
        span: 12
      },
    }

    // Only show error after a field is touched.
    const clientIdError = isFieldTouched('clientID') && getFieldError('clientID')
    const clientSecretError = isFieldTouched('clientSecret') && getFieldError('clientSecret')

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
      <Form {...formConfig} onSubmit={this.handleSubmit}>
        <div>{formErrorMessage()}</div>
        <Form.Item label="Client ID" validateStatus={clientIdError ? 'error' : ''} help={clientIdError || ''}>
          {getFieldDecorator('clientID', {
            rules: [{ required: true, message: 'Please enter your client ID!' }],
          })(
            <Input placeholder="Client ID" />,
          )}
        </Form.Item>
        <Form.Item label="Client secret" validateStatus={clientSecretError ? 'error' : ''} help={clientSecretError || ''}>
          {getFieldDecorator('clientSecret', {
            rules: [{ required: true, message: 'Please enter your client secret!' }],
          })(
            <Input placeholder="Client secret" type="password"/>,
          )}
        </Form.Item>
        <Form.Item style={{ marginBottom: '0'}}>
          <Button type="primary" htmlType="submit" disabled={this.disableButton(getFieldsError())}>{this.state.buttonText}</Button>
        </Form.Item>
      </Form>
    )
  }
}

const WrappedAuthConfigForm = Form.create({ name: 'auth_config' })(AuthConfigForm)

export default WrappedAuthConfigForm
