import { Button, Row, Col, Card } from 'antd'

const LoginPage = ({ configuredProviders }) => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col>
        <Card title="Login" style={{ textAlign: 'center' }}>
          <p>Login using one of the configured Identity Providers below</p>
          {configuredProviders.map(p => (
            <Button key={p.id} style={{ margin: '5px' }} type="primary">
              <a href={`/login/${p.id}`}>Login with {p.displayName}</a>
            </Button>
          ))}
        </Card>
      </Col>
    </Row>
  </div>
)

LoginPage.getInitialProps = ({ req }) => {
  return {
    title: 'Login',
    unrestrictedPage: true,
    configuredProviders: req.configuredProviders
  }
}

export default LoginPage
