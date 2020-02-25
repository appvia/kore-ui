import PropTypes from 'prop-types'
import axios from 'axios'
import { Button, Row, Col, Card, Form, Input, Alert, Icon } from 'antd'
import copy from '../lib/utils/object-copy'
import redirect from '../lib/utils/redirect'

class LoginPage extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    authProvider: PropTypes.object,
    connectorId: PropTypes.string,
    embeddedAuth: PropTypes.bool,
    loginError: PropTypes.number
  }

  static staticProps = ({ req }) => {
    let connectorId
    if (req.authProvider) {
      connectorId = `${req.authProvider.metadata.name}-${Object.keys(req.authProvider.spec.config).pop()}`
    }
    return {
      title: 'Kore Login',
      unrestrictedPage: true,
      authProvider: req.authProvider,
      connectorId,
      embeddedAuth: req.embeddedAuth || false,
      loginError: req.loginError
    }
  }

  static errorCodeMessages = {
    401: 'Invalid username or password.',
    500: 'A technical problem occurred, please try again later.'
  }

  state = {
    showLoginForm: !this.props.authProvider && this.props.embeddedAuth,
    submitting: false,
    localLoginErrorCode: this.props.loginError || false
  }

  showLoginForm = () => {
    const state = copy(this.state)
    state.showLoginForm = true
    this.setState(state)
  }

  disableButton = fieldsError => {
    if (this.state.submitting) {
      return true
    }
    return Object.keys(fieldsError).some(field => fieldsError[field])
  }

  handleSubmit = e => {
    e.preventDefault()
    this.props.form.validateFields(async (err, values) => {
      if (!err) {
        const state = copy(this.state)
        state.submitting = true
        this.setState(state)

        try {
          await axios.post(`${window.location.origin}/login`, values)
          return redirect(null, '/login/process', true)
        } catch (err) {
          const state = copy(this.state)
          state.localLoginErrorCode = err.response.status
          state.submitting = false
          this.setState(state)
        }
      }
    })
  }

  render() {
    const { authProvider, connectorId, embeddedAuth } = this.props
    const { localLoginErrorCode, showLoginForm, submitting }  = this.state
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

    const formErrorMessage = () => {
      if (localLoginErrorCode) {
        return (
          <Alert
            message={LoginPage.errorCodeMessages[localLoginErrorCode]}
            type="error"
            showIcon
            style={{ marginBottom: '20px' }}
          />
        )
      }
      return null
    }

    const usernameError = isFieldTouched('login') && getFieldError('login')
    const passwordError = isFieldTouched('password') && getFieldError('password')

    return (
      <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
        <Row type="flex" justify="center">
          <Col>
            <Card title="Login" style={{ textAlign: 'center' }}>
              <div>{formErrorMessage()}</div>
              {authProvider || !embeddedAuth ? (
                <div>
                  <p>Login using the configured Identity Provider below</p>
                  <Button style={{ margin: '5px' }} type="primary">
                    {authProvider ? <a href={`/login/auth?provider=${connectorId}`}>Login with {authProvider.spec.displayName}</a> : null }
                    {!embeddedAuth ? <a href="/login/auth">Login with Identity Provider</a> : null }
                  </Button>
                  <Button style={{ marginLeft: '10px' }} onClick={this.showLoginForm}>Local user login</Button>
                </div>
              ) : null}
              {showLoginForm ? (
                <Form layout="inline" onSubmit={this.handleSubmit} style={{ marginTop: '20px' }}>
                  <Form.Item validateStatus={usernameError ? 'error' : ''} help={usernameError || ''}>
                    {getFieldDecorator('login', {
                      rules: [{ required: true, message: 'Please input your username!' }],
                    })(
                      <Input
                        prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        placeholder="Username"
                      />,
                    )}
                  </Form.Item>
                  <Form.Item validateStatus={passwordError ? 'error' : ''} help={passwordError || ''}>
                    {getFieldDecorator('password', {
                      rules: [{ required: true, message: 'Please input your Password!' }],
                    })(
                      <Input
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                        type="password"
                        placeholder="Password"
                      />,
                    )}
                  </Form.Item>
                  <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting} disabled={this.disableButton(getFieldsError())}>
                      Log in
                    </Button>
                  </Form.Item>
                </Form>
              ) : null}
            </Card>
          </Col>
        </Row>
      </div>
    )
  }
}

const WrappedLoginPage = Form.create({ name: 'login' })(LoginPage)

export default WrappedLoginPage
