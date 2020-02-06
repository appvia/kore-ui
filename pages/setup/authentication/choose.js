import Link from 'next/link'
import { Typography, Alert, Button, Row, Col, Card } from 'antd'
const { Paragraph, Title } = Typography

const ChooseAuthPage = () => (
  <div style={{ padding: '10px 50px' }}>
    <Title>Choose authentication mechanism</Title>
    <Alert
      message={
        <div>
          <Paragraph>Kore uses your Identity Provider (IdP) in order to manage users and authentication, this must be configured before you can begin using Kore.</Paragraph>
          <Paragraph>You will be guided through the setup over the next few screens.</Paragraph>
          <Paragraph style={{ marginBottom: '0' }} strong>Begin by choosing your IdP below</Paragraph>
        </div>
      }
      type="info"
    />
    <Row gutter={16} type="flex" style={{ marginTop: '20px' }}>
      <Col span={8}>
        <Card
          style={{ height: '100%', paddingBottom: '50px' }}
          bodyStyle={{ height: '100%' }}
        >
          <Title level={3}>Google</Title>
          <Paragraph strong>OpenID Connect</Paragraph>
          <Paragraph>Use your organisation&apos;s Google account for authentication.</Paragraph>
          <Button type="primary" style={{ position: 'absolute', bottom: '25px' }}>
            <Link href="/setup/authentication/google">
              <a>Use Google</a>
            </Link>
          </Button>
        </Card>
      </Col>
      <Col span={8}>
        <Card
          style={{ height: '100%', paddingBottom: '50px' }}
        >
          <Title level={3}>GitHub</Title>
          <Paragraph strong>OAuth</Paragraph>
          <Paragraph>Use your organisation&apos;s GitHub account for authentication.</Paragraph>
          <Button type="primary" style={{ position: 'absolute', bottom: '25px' }}>
            <Link href="/setup/authentication/github">
              <a>Use Github</a>
            </Link>
          </Button>
        </Card>
      </Col>
      <Col span={8}>
        <Card
          style={{ height: '100%', paddingBottom: '50px' }}
        >
          <Title level={3}>SAML</Title>
          <Paragraph>Use SAML for single-sign-on using your organisation&apos;s Identity Provider.</Paragraph>
          <Button type="primary" style={{ position: 'absolute', bottom: '25px' }}>
            <Link href="/setup/authentication/saml">
              <a>Use SAML</a>
            </Link>
          </Button>
        </Card>
      </Col>
    </Row>
  </div>
)

ChooseAuthPage.staticProps = {
  title: 'Setup authentication',
  hideSider: true,
  adminOnly: true
}

export default ChooseAuthPage
