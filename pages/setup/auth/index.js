import Link from 'next/link'
import { Button, Row, Col, Card, Typography, Layout } from 'antd'
const { Footer } = Layout
const { Title } = Typography;

const SetupAuthIndexPage = () => (
  <div>
    <Row type="flex" justify="center">
      <Col span={24}>
        <Card style={{ backgroundColor: '#f5f5f5' }}>
          <Title>Welcome to the Hub!</Title>
          <Title level={4}>Authentication is not currently configured</Title>
          <p>This must be done before any teams can start using the hub</p>
          <Button type="primary">
            <Link href="/setup/auth/configure">
              <a>Begin setup</a>
            </Link>
          </Button>
        </Card>
      </Col>
    </Row>
    <Footer style={{textAlign: 'center', backgroundColor: '#fff'}}>
      <span>
        For more information read the <a href="#">Documentation</a>
      </span>
    </Footer>
  </div>
)

SetupAuthIndexPage.getInitialProps = async () => {
  return {
    title: 'No authentication provider configured',
    unrestrictedPage: true
  }
}

export default SetupAuthIndexPage
