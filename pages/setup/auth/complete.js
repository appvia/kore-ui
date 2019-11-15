import { Button, Row, Col, Card, Typography, Icon } from 'antd'
const { Title, Text } = Typography;

const SetupAuthCompletePage = () => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col span={24}>
        <Card style={{ backgroundColor: '#f5f5f5' }}>
          <Title><Icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" /> Authentication setup complete</Title>
          <Title level={4}>GitHub has been configured as your Identity Provider.</Title>
          <p>It's recommended that you now <Text strong>Login with GitHub</Text> to continue the setup.</p>
          <Button type="primary">
            <a href="/login/github">Login with GitHub</a>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

SetupAuthCompletePage.getInitialProps = async () => {
  return {
    title: 'Authentication setup complete',
    unrestrictedPage: true
  }
}

export default SetupAuthCompletePage
