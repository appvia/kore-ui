import { Button, Row, Col, Card } from 'antd'

const LoginPage = () => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col span={8}>
        <Card title="Login" style={{ width: 300, textAlign: 'center' }}>
          <p>Login using the configured Identity Provider</p>
          <Button type="primary">
            <a href="/login/github">Login with GitHub</a>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

LoginPage.getInitialProps = () => {
  return {
    title: 'Login',
    unrestrictedPage: true
  }
}

export default LoginPage
