import PropTypes from 'prop-types'
import { Button, Row, Col, Card } from 'antd'

const LoginPage = ({ authProvider }) => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col>
        <Card title="Login" style={{ textAlign: 'center' }}>
          <p>Login using the configured Identity Provider below</p>
          <Button key={authProvider.id} style={{ margin: '5px' }} type="primary">
            <a href={`/login/${authProvider.metadata.name}`}>Login with {authProvider.spec.displayName}</a>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

LoginPage.staticProps = ({ req }) => {
  return {
    title: 'Login',
    unrestrictedPage: true,
    authProvider: req.authProvider
  }
}

LoginPage.propTypes = {
  authProvider: PropTypes.object.isRequired
}

export default LoginPage
