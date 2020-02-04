import PropTypes from 'prop-types'
import axios from 'axios'
import { Button, Row, Col, Card, Form, Input, Alert, Icon } from 'antd'
import copy from '../lib/utils/object-copy'
import redirect from '../lib/utils/redirect'

class LoginPage extends React.Component {
  static propTypes = {
    form: PropTypes.object.isRequired,
    authProvider: PropTypes.object,
    connectorId: PropTypes.string
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
    }
  }

  static errorCodeMessages = {
    401: 'Invalid username or password.',
    500: 'A technical problem occurred, please try again later.'
  }

  state = {
    showLoginForm: !this.props.authProvider,
    submitting: false,
    localLoginErrorCode: false
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
    const { authProvider, connectorId } = this.props
    const { getFieldDecorator, getFieldsError, getFieldError, isFieldTouched } = this.props.form

    const formErrorMessage = () => {
      if (this.state.localLoginErrorCode) {
        return (
          <Alert
            message={LoginPage.errorCodeMessages[this.state.localLoginErrorCode]}
            type="error"
            showIcon
            closable
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
              {authProvider ? (
                <div>
                  <p>Login using the configured Identity Provider below</p>
                  <Button style={{ margin: '5px' }} type="primary">
                    <a href={`/login/auth?provider=${connectorId}`}>Login with {authProvider.spec.displayName}</a>
                  </Button>
                  <Button style={{ marginLeft: '10px' }} onClick={this.showLoginForm}>Local user login</Button>
                </div>
              ) : null}
              {this.state.showLoginForm ? (
                <Form layout="inline" onSubmit={this.handleSubmit} style={{ marginTop: '20px' }}>
                  <div>{formErrorMessage()}</div>
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
                    <Button type="primary" htmlType="submit" loading={this.state.submitting} disabled={this.disableButton(getFieldsError())}>
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
