import PropTypes from 'prop-types'
import { Button, Row, Col, Card } from 'antd'

const LoginPage = ({ authProvider, connectorId }) => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col>
        <Card title="Login" style={{ textAlign: 'center' }}>
          <p>Login using the configured Identity Provider below</p>
          <Button style={{ margin: '5px' }} type="primary">
            <a href={`/login/auth?provider=${connectorId}`}>Login with {authProvider.spec.displayName}</a>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

LoginPage.staticProps = ({ req }) => {
  const connectorId = `${req.authProvider.metadata.name}-${Object.keys(req.authProvider.spec.config).pop()}`
  return {
    title: 'Login',
    unrestrictedPage: true,
    authProvider: req.authProvider,
    connectorId
  }
}

LoginPage.propTypes = {
  authProvider: PropTypes.object.isRequired,
  connectorId: PropTypes.string.isRequired
}

export default LoginPage
