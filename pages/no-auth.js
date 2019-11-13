import { Button, Row, Col, Card, Typography } from 'antd'
const { Title } = Typography;

const NoAuthPage = () => (
  <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
    <Row type="flex" justify="center">
      <Col span={24}>
        <Card>
          <Title>Welcome to the Hub!</Title>
          <Title level={4}>Authentication is not currently configured.</Title>
          <p>This must be done before any teams can start using the hub.</p>
          <Button type="primary">
            <a href="/login/github">Start</a>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

NoAuthPage.getInitialProps = async () => {
  return {
    title: 'No authentication provider configured',
    unrestrictedPage: true
  }
}

export default NoAuthPage
