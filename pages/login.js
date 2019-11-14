import { Button, Row, Col, Card } from 'antd'

const LoginPage = ({ authProvider }) => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col>
        <Card title="Login" style={{ textAlign: 'center' }}>
          <p>Login using the configured Identity Provider below</p>
          <Button key={authProvider.id} style={{ margin: '5px' }} type="primary">
            <a href={`/login/${authProvider.id}`}>Login with {authProvider.displayName}</a>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

LoginPage.getInitialProps = ({ req }) => {
  return {
    title: 'Login',
    unrestrictedPage: true,
    authProvider: req.authProvider
  }
}

export default LoginPage
