import PropTypes from 'prop-types'
import { Button, Row, Col, Card, Form, Alert } from 'antd'
import copy from '../lib/utils/object-copy'

class LoginPage extends React.Component {
  static propTypes = {
    authProvider: PropTypes.object,
    connectorId: PropTypes.string,
    localLoginError: PropTypes.string
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
      localLoginError: req.localLoginError || ''
    }
  }

  static errorCodeMessages = {
    'INVALID_CREDENTIALS': 'Invalid username or password.',
    'SERVER_ERROR': 'A technical problem occurred, please try again later.'
  }

  state = {
    showLoginForm: !this.props.authProvider
  }

  showLoginForm = () => {
    const state = copy(this.state)
    state.showLoginForm = true
    this.setState(state)
  }

  render() {
    const { authProvider, connectorId, localLoginError } = this.props

    const formErrorMessage = () => {
      if (localLoginError) {
        return (
          <Alert
            message={LoginPage.errorCodeMessages[localLoginError]}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '20px', marginTop: '-20px' }}
          />
        )
      }
      return null
    }

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
                <form action="/login" method="post" className="ant-form ant-form-inline" style={{ marginTop: '20px' }}>
                  <div>{formErrorMessage()}</div>
                  <Row className="ant-form-item">
                    <Col className="ant-form-item-control-wrapper">
                      <div className="ant-form-item-control">
                        <input className="ant-input" type="text" id="login" name="login" placeholder="Username" />
                      </div>
                    </Col>
                  </Row>
                  <Row className="ant-form-item">
                    <Col className="ant-form-item-control-wrapper">
                      <div className="ant-form-item-control">
                        <input className="ant-input" type="password" id="password" name="password" placeholder="Password" />
                      </div>
                    </Col>
                  </Row>
                  <Row className="ant-form-item" style={{ paddingTop: '4px' }}>
                    <Col className="ant-form-item-control-wrapper">
                      <div className="ant-form-item-control">
                        <input className="ant-btn ant-btn-primary" type="submit" value="Log in"/>
                      </div>
                    </Col>
                  </Row>
                </form>
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
